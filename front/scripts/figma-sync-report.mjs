#!/usr/bin/env node
// Figma → 코드 구현 격차 리포트.
// 코드를 고치지 않는다. 무엇이 아직 반영되지 않았는지만 보고한다.
//
//   FIGMA_TOKEN=... node scripts/figma-sync-report.mjs [--images] [--write] [--cache <path>]
//
//   --images  변경/미구현 프레임의 Figma 렌더 PNG 링크를 포함 (API 1회 추가)
//   --write   .figma-sync-state.json 갱신 (기본은 갱신하지 않음)
//   --cache   이미 받아둔 파일 JSON 재사용 (API 호출 0회)

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const FRONT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MAP_PATH = `${FRONT}/.figma-sync-map.json`;
const STATE_PATH = `${FRONT}/.figma-sync-state.json`;

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const opt = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : null; };

// 실화면으로 간주할 최소 크기. 이보다 작은 최상위 노드는 라벨·알럿·주석 조각으로 본다.
const MIN_W = 1300, MIN_H = 250;

const cfg = JSON.parse(readFileSync(MAP_PATH, "utf8"));
const prev = existsSync(STATE_PATH) ? JSON.parse(readFileSync(STATE_PATH, "utf8")) : null;

// ── 1. 파일 JSON 확보 ───────────────────────────────────────────────
async function figma(path) {
  const token = process.env.FIGMA_TOKEN;
  if (!token) { console.error("FIGMA_TOKEN 환경변수가 없습니다."); process.exit(2); }
  const res = await fetch(`https://api.figma.com/v1/${path}`, { headers: { "X-Figma-Token": token } });
  if (!res.ok) { console.error(`Figma API ${res.status}: ${(await res.text()).slice(0, 300)}`); process.exit(2); }
  return res.json();
}

const cachePath = opt("--cache");
const doc = cachePath
  ? JSON.parse(readFileSync(cachePath, "utf8"))
  : await figma(`files/${cfg.fileKey}`);

// ── 2. 정규화 + 해싱 ────────────────────────────────────────────────
// 캔버스에서 프레임을 이동만 해도 절대좌표가 바뀌어 오탐이 난다. 위치를 털어내고 해싱한다.
function strip(node, isRoot = false) {
  if (Array.isArray(node)) return node.map((n) => strip(n));
  if (node === null || typeof node !== "object") return node;
  const out = {};
  for (const [k, v] of Object.entries(node)) {
    if (k === "absoluteBoundingBox" || k === "absoluteRenderBounds") {
      out[k] = v && typeof v === "object" ? { width: v.width, height: v.height } : v;
    } else if (isRoot && k === "relativeTransform") {
      continue; // 루트의 relativeTransform = 캔버스 위치. 의미 없음.
    } else {
      out[k] = strip(v);
    }
  }
  return out;
}
const hashOf = (node) =>
  createHash("sha256").update(JSON.stringify(strip(node, true))).digest("hex").slice(0, 16);

const page = doc.document.children.find((p) => p.id === cfg.pageId);
if (!page) { console.error(`페이지 ${cfg.pageId} 를 찾을 수 없습니다.`); process.exit(2); }

const ignore = new Set(cfg.ignore || []);
const frames = [];
for (const n of page.children) {
  if (ignore.has(n.name)) continue;
  const bb = n.absoluteBoundingBox || {};
  const mapped = Object.prototype.hasOwnProperty.call(cfg.map, n.name);
  const bigEnough = n.type === "FRAME" && (bb.width || 0) >= MIN_W && (bb.height || 0) >= MIN_H;
  if (!mapped && !bigEnough) continue; // 라벨·알럿·주석 조각
  frames.push({
    id: n.id, name: n.name, mapped,
    w: Math.round(bb.width || 0), h: Math.round(bb.height || 0),
    hash: hashOf(n),
  });
}

// ── 3. 라우트 구현 상태 판정 ─────────────────────────────────────────
const gitDate = (rel) => {
  try {
    return execFileSync("git", ["log", "-1", "--format=%cs", "--", rel], { cwd: FRONT, encoding: "utf8" }).trim() || null;
  } catch { return null; }
};
function routeStatus(route) {
  if (!route) return { state: "none", label: "라우트 없음", date: null, lines: 0 };
  const abs = `${FRONT}/${route}`;
  if (!existsSync(abs)) return { state: "none", label: "파일 없음", date: null, lines: 0 };
  const src = readFileSync(abs, "utf8");
  const lines = src.split("\n").length;
  const stub = /\bComingSoon\b/.test(src);
  return { state: stub ? "stub" : "done", label: stub ? "ComingSoon 스텁" : "구현됨", date: gitDate(route), lines };
}

// 같은 이름 프레임을 하나의 "화면"으로 묶는다 (진단 관리 32개 → 화면 1개).
const screens = new Map();
for (const f of frames) {
  if (!screens.has(f.name)) {
    const entry = cfg.map[f.name] || {};
    screens.set(f.name, { name: f.name, mapped: f.mapped, route: entry.route ?? null, note: entry.note || null, frames: [] });
  }
  screens.get(f.name).frames.push(f);
}
for (const s of screens.values()) s.status = s.mapped ? routeStatus(s.route) : null;

// ── 4. 이전 상태와 diff ─────────────────────────────────────────────
const prevFrames = prev?.frames || null;
const changed = [], added = [], removed = [];
if (prevFrames) {
  const seen = new Set();
  for (const f of frames) {
    seen.add(f.id);
    const p = prevFrames[f.id];
    if (!p) added.push(f);
    else if (p.hash !== f.hash) changed.push({ ...f, since: p.lastChangedAt });
  }
  for (const [id, p] of Object.entries(prevFrames)) if (!seen.has(id)) removed.push({ id, ...p });
}

// ── 5. 스크린샷 링크 (선택) ──────────────────────────────────────────
let images = {};
if (has("--images")) {
  const want = [...new Set([
    ...changed.map((f) => f.id), ...added.map((f) => f.id),
    ...[...screens.values()].filter((s) => s.status && s.status.state !== "done").map((s) => s.frames[0].id),
  ])].slice(0, 40);
  if (want.length) {
    const r = await figma(`images/${cfg.fileKey}?ids=${want.join(",")}&format=png&scale=1`);
    images = r.images || {};
  }
}

// ── 6. 리포트 ───────────────────────────────────────────────────────
const today = doc.lastModified?.slice(0, 10) || "unknown";
const L = [];
const shot = (id) => (images[id] ? ` · [스크린샷](${images[id]})` : "");
const figmaLink = (id) =>
  `https://www.figma.com/design/${cfg.fileKey}/?node-id=${id.replace(":", "-")}`;

L.push(`# PPWR Figma → 코드 격차 리포트`);
L.push(`파일 최종수정 **${doc.lastModified}** · 화면 ${screens.size}종 / 프레임 ${frames.length}개`);
L.push(prevFrames ? `이전 실행: ${prev.lastSyncedAt}` : `**첫 실행 — 기준선(baseline) 수립.** 변경 비교는 다음 실행부터.`);
L.push("");

const notDone = [...screens.values()].filter((s) => s.status && s.status.state !== "done");
L.push(`## 아직 코드에 반영되지 않은 화면 (${notDone.length})`);
if (!notDone.length) L.push(`없음.`);
for (const s of notDone.sort((a, b) => b.frames.length - a.frames.length)) {
  const f = s.frames[0];
  L.push(`- **${s.name}** — Figma 프레임 ${s.frames.length}개 / 코드: ${s.status.label}` +
    (s.status.date ? ` (${s.status.date} 이후 변경 없음)` : "") +
    `\n  ${s.route ? `\`front/${s.route}\`` : s.note || "대응 라우트 미정"} · [Figma](${figmaLink(f.id)})${shot(f.id)}`);
}
L.push("");

if (prevFrames) {
  L.push(`## 디자인 변경 (${changed.length})`);
  if (!changed.length) L.push(`없음.`);
  for (const f of changed) {
    const s = screens.get(f.name);
    const st = s.status;
    // 디자인이 코드보다 최신이면 = 아직 안 옮겨졌을 가능성이 높다. 부분 구현을 잡는 유일한 신호.
    let verdict = st?.label || "매핑 없음";
    if (st?.state === "done" && st.date && st.date < today) {
      verdict = `구현됨이지만 코드는 ${st.date} — **디자인이 더 최신, 반영 확인 필요**`;
    }
    L.push(`- **${f.name}** \`${f.id}\` — ${verdict} · [Figma](${figmaLink(f.id)})${shot(f.id)}`);
  }
  L.push("");
  if (added.length) {
    L.push(`## 신규 프레임 (${added.length})`);
    for (const f of added) L.push(`- **${f.name}** \`${f.id}\` ${f.w}x${f.h} · [Figma](${figmaLink(f.id)})${shot(f.id)}`);
    L.push("");
  }
  if (removed.length) {
    L.push(`## 삭제된 프레임 (${removed.length})`);
    for (const f of removed) L.push(`- ~~${f.name}~~ \`${f.id}\``);
    L.push("");
  }
}

const unmapped = [...screens.values()].filter((s) => !s.mapped);
if (unmapped.length) {
  L.push(`## 매핑 없음 — \`.figma-sync-map.json\` 에 추가 필요 (${unmapped.length})`);
  for (const s of unmapped) L.push(`- **${s.name}** (프레임 ${s.frames.length}개) \`${s.frames[0].id}\``);
  L.push("");
}

const done = [...screens.values()].filter((s) => s.status?.state === "done");
L.push(`## 구현된 화면 (${done.length})`);
L.push(done.map((s) => `${s.name}`).join(" · ") || "없음");
L.push("");
L.push(`> "구현됨"은 라우트 파일이 \`ComingSoon\` 스텁이 아니라는 뜻일 뿐, 디자인과 일치한다는 뜻이 아닙니다.`);
L.push(`> 부분 구현은 위 "디자인 변경" 항목의 날짜 비교로만 드러납니다.`);

const report = L.join("\n");
console.log(report);

// ── 7. 상태 저장 ────────────────────────────────────────────────────
if (has("--write")) {
  const out = { fileKey: cfg.fileKey, pageId: cfg.pageId, lastSyncedVersion: doc.version, lastSyncedAt: doc.lastModified, frames: {} };
  for (const f of frames) {
    const p = prevFrames?.[f.id];
    out.frames[f.id] = { name: f.name, hash: f.hash, lastChangedAt: !p || p.hash !== f.hash ? today : p.lastChangedAt };
  }
  writeFileSync(STATE_PATH, JSON.stringify(out, null, 2) + "\n");
  console.error(`\n[state] ${STATE_PATH} 갱신 (프레임 ${frames.length}개)`);
}
