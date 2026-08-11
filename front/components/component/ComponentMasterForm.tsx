"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Info, Trash2 } from "lucide-react";
import {
  AXIS_LABEL,
  COMPONENT_TYPE_SPECS,
  type ComponentTypeSpec,
  type SpecDoc,
  type SpecField,
} from "@/src/lib/ppwr-component-spec";
import { getPpwrComponentService } from "@/src/shared/api";

/** 신규 축(세부형태·재질군·상세재질·첨부문서)은 material_summary(JSON)에 예약 키로 보관 */
const RK = {
  subType: "__sub_type",
  materialGroup: "__material_group",
  materialDetail: "__material_detail",
  doc: (name: string) => `__doc:${name}`,
};

/** admin이 관리하는 DB 설정(ppwr.ComponentTypeConfig) → 폼이 쓰는 spec 모양으로 변환 */
function dbToSpecs(
  rows: NonNullable<Awaited<ReturnType<ReturnType<typeof getPpwrComponentService>["listTypeConfigs"]>>>,
): ComponentTypeSpec[] {
  return rows.map((r) => ({
    key: r.type_key,
    emoji: r.emoji ?? "",
    fields: r.fields.map((f) => ({
      key: f.key,
      label: f.label,
      type: f.input_type,
      options: f.options,
      unit: f.unit,
      hint: f.hint,
      axis: f.axis,
    })),
    sub_types: r.sub_types,
    materials: r.materials,
    docs: r.docs,
  }));
}
const DATA_STATUS: { v: string; l: string }[] = [
  { v: "provided", l: "자료 있음" },
  { v: "unknown", l: "모름" },
  { v: "need_check", l: "확인 필요" },
  { v: "not_available", l: "자료 없음" },
];

export type ComponentMasterFormValues = {
  name: string;
  type: string | null;
  material_summary: string | null; // ⚠️ 유형별 상세(attributes) JSON 을 여기 보관 (전용 컬럼 생기기 전 임시)
  recycled_content: number | null;
  pfas_status: string;
  heavy_metal_status: string;
  compostability_status: string;
};

type S = Record<string, string>;
function toBase(d?: Partial<Record<string, unknown>>): S {
  const g = (k: string, def = "") => (d && d[k] != null ? String(d[k]) : def);
  return {
    name: g("name"),
    type: g("type"),
    recycled_content: g("recycled_content"),
    pfas_status: g("pfas_status", "unknown"),
    heavy_metal_status: g("heavy_metal_status", "unknown"),
    compostability_status: g("compostability_status", "unknown"),
  };
}
/** material_summary(JSON) → attrs 상태(문자열 맵) */
function toAttrs(d?: Partial<Record<string, unknown>>): S {
  const raw = d && d["material_summary"] != null ? String(d["material_summary"]) : "";
  if (!raw.trim().startsWith("{")) return {};
  try {
    const obj = JSON.parse(raw) as Record<string, unknown>;
    const out: S = {};
    for (const [k, v] of Object.entries(obj)) out[k] = v == null ? "" : String(v);
    return out;
  } catch {
    return {};
  }
}

export default function ComponentMasterForm({
  title,
  subtitle,
  defaults,
  submitLabel = "저장하기",
  pending,
  error,
  readOnly,
  onSubmit,
  onDelete,
  deleting,
  cancelHref = "/app/components",
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  defaults?: Partial<Record<string, unknown>>;
  submitLabel?: string;
  pending?: boolean;
  error?: string | null;
  readOnly?: boolean;
  onSubmit: (v: ComponentMasterFormValues) => void;
  onDelete?: () => void;
  deleting?: boolean;
  cancelHref?: string;
  children?: ReactNode;
}) {
  const [f, setF] = useState<S>(() => toBase(defaults));
  const [attrs, setAttrs] = useState<S>(() => toAttrs(defaults));
  const [localErr, setLocalErr] = useState<string | null>(null);
  const set = (k: string) => (v: string) => setF((s) => ({ ...s, [k]: v }));
  const setAttr = (k: string) => (v: string) => setAttrs((s) => ({ ...s, [k]: v }));
  const num = (v: string) => (v.trim() === "" ? null : Number(v));

  // 유형별 필드 정의: admin 관리 DB 설정 우선, 없으면(미마이그레이션) 하드코딩 폴백
  const { data: dbConfigs } = useQuery({
    queryKey: ["ppwr", "type-configs"],
    queryFn: () => getPpwrComponentService().listTypeConfigs(),
    staleTime: 5 * 60 * 1000,
  });
  // 재질군 → 상세재질 전역 매핑 (admin 관리)
  const { data: matGroups } = useQuery({
    queryKey: ["ppwr", "material-groups"],
    queryFn: () => getPpwrComponentService().listMaterialGroups(),
    staleTime: 5 * 60 * 1000,
  });
  const specs = useMemo<ComponentTypeSpec[]>(
    () => (dbConfigs && dbConfigs.length ? dbToSpecs(dbConfigs) : COMPONENT_TYPE_SPECS),
    [dbConfigs],
  );
  const TYPE_OPTIONS = specs.map((s) => s.key);
  const spec = specs.find((s) => s.key === f.type);

  // 재질군/상세재질 옵션
  const groupsByKey = useMemo(() => new Map((matGroups ?? []).map((g) => [g.group_key, g])), [matGroups]);
  const materialOptions = spec?.materials ?? [];
  const selectedGroup = attrs[RK.materialGroup] ?? "";
  const detailOptions = selectedGroup ? groupsByKey.get(selectedGroup)?.details ?? [] : [];

  // 선택 섹션은 접힌 채 시작 — 채운 값은 요약으로 표시, 클릭 시 펼침
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const toggle = (k: string) => setOpen((o) => ({ ...o, [k]: !o[k] }));
  const openOne = (k: string) => setOpen((o) => ({ ...o, [k]: true }));

  const statusLabel = (v: string) => DATA_STATUS.find((s) => s.v === v)?.l ?? v;
  const joinDot = (parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" · ");
  const filledFieldCount = spec ? spec.fields.filter((fd) => (attrs[fd.key] ?? "") !== "").length : 0;
  const docTotal = spec?.docs?.length ?? 0;
  const docProvided = spec?.docs?.filter((d) => (attrs[RK.doc(d.name)] ?? "unknown") === "provided").length ?? 0;
  const docTouched = spec?.docs?.some((d) => (attrs[RK.doc(d.name)] ?? "unknown") !== "unknown") ?? false;
  const socParts = ([
    ["PFAS", f.pfas_status],
    ["중금속", f.heavy_metal_status],
    ["퇴비화", f.compostability_status],
  ] as [string, string][])
    .filter(([, v]) => v && v !== "unknown")
    .map(([k, v]) => `${k} ${statusLabel(v)}`);
  const summary = {
    materials: joinDot([selectedGroup, attrs[RK.materialDetail]]),
    fields: filledFieldCount ? `${filledFieldCount}개 입력됨` : "",
    docs: docTouched ? `${docProvided}/${docTotal} 자료 확보` : "",
    soc: socParts.join(" · "),
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setLocalErr(null);
    if (!f.name.trim()) return setLocalErr("부품명은 필수입니다.");

    // 현재 유형의 스펙 필드만 골라 attributes JSON 구성 (빈 값 제외)
    const attrObj: Record<string, unknown> = {};
    if (spec) {
      for (const field of spec.fields) {
        const v = attrs[field.key];
        if (v == null || v === "") continue;
        attrObj[field.key] = field.type === "number" ? Number(v) : field.type === "bool" ? v === "true" : v;
      }
    }
    // 신규 축(세부형태·재질군·상세재질·첨부문서 확보상태) — 예약 키(__)로 함께 보관
    for (const k of Object.keys(attrs)) {
      if (!k.startsWith("__")) continue;
      const v = attrs[k];
      if (v == null || v === "") continue;
      attrObj[k] = v;
    }
    const material_summary = Object.keys(attrObj).length ? JSON.stringify(attrObj) : null;

    onSubmit({
      name: f.name.trim(),
      type: f.type || null,
      material_summary,
      recycled_content: num(f.recycled_content),
      pfas_status: f.pfas_status,
      heavy_metal_status: f.heavy_metal_status,
      compostability_status: f.compostability_status,
    });
  }
  const err = error ?? localErr;

  return (
    <form onSubmit={submit} className="px-8 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-ink">
            {title} <Info className="h-4 w-4 text-slate-300" />
          </h1>
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
        </div>
        {!readOnly && (
          <div className="flex gap-2">
            {onDelete ? (
              <button type="button" onClick={onDelete} disabled={deleting} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-danger hover:bg-red-50 disabled:opacity-60">
                <Trash2 className="h-4 w-4" /> 부품 삭제
              </button>
            ) : (
              <Link href={cancelHref} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">취소</Link>
            )}
            <button type="submit" disabled={pending} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
              {pending ? "저장 중…" : submitLabel}
            </button>
          </div>
        )}
      </div>

      {readOnly && (
        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          리베이션 공용 부품은 조회만 가능합니다. 내 라이브러리에 등록한 부품만 수정할 수 있습니다.
        </p>
      )}
      {err && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-danger">{err}</p>}

      <fieldset disabled={readOnly} className="mt-6 space-y-3">
        <Section title="부품 기본 정보" desc="부품을 식별하는 기본 정보입니다. 포장형태를 선택하면 아래에 형태별 상세 항목이 나타납니다.">
          <Grid>
            <Field label="부품명" required value={f.name} onChange={set("name")} placeholder="예: PP 스크류 캡" />
            <Select label="포장형태" value={f.type} onChange={set("type")} options={TYPE_OPTIONS} />
            {spec?.sub_types?.length ? (
              <Select label="세부 포장형태" value={attrs[RK.subType] ?? ""} onChange={setAttr(RK.subType)} options={spec.sub_types} />
            ) : null}
            <Field label="재생원료(PCR) 함량 (%)" type="number" value={f.recycled_content} onChange={set("recycled_content")} placeholder="0" />
          </Grid>
        </Section>

        {spec?.materials?.length ? (
          <AccSection n={2} title="재질 및 구조" desc="재질군·상세 재질 (관리자 관리)" summary={summary.materials} open={!!open.materials} onToggle={() => toggle("materials")} onOpen={() => openOne("materials")}>
            <Grid>
              <Select
                label="재질군"
                value={selectedGroup}
                onChange={(v) => {
                  setAttr(RK.materialGroup)(v);
                  setAttr(RK.materialDetail)("");
                }}
                options={materialOptions}
              />
              <Select
                label="상세 재질"
                value={attrs[RK.materialDetail] ?? ""}
                onChange={setAttr(RK.materialDetail)}
                options={detailOptions}
              />
            </Grid>
          </AccSection>
        ) : null}

        {spec && spec.fields.length > 0 && (
          <AccSection n={3} title={`${spec.key} — 상세`} desc="PPWR 재활용성·재생원료·유해물질 판정용 상세 항목" summary={summary.fields} open={!!open.fields} onToggle={() => toggle("fields")} onOpen={() => openOne("fields")}>
            <Grid>
              {spec.fields.map((field) => (
                <SpecInput key={field.key} field={field} value={attrs[field.key] ?? ""} onChange={setAttr(field.key)} />
              ))}
            </Grid>
          </AccSection>
        )}
        {f.type && !spec?.fields.length && (
          <p className="rounded-xl border border-dashed border-slate-200 px-4 py-4 text-center text-sm text-slate-400">
            이 유형은 별도 상세 항목이 없습니다.
          </p>
        )}

        {spec?.docs?.length ? (
          <AccSection n={4} title="첨부문서 체크리스트" desc="PPWR 근거문서 확보 상태 (누락 시 리포트에 표시)" summary={summary.docs} open={!!open.docs} onToggle={() => toggle("docs")} onOpen={() => openOne("docs")}>
            <div className="space-y-3">
              {spec.docs.map((d) => (
                <DocRow key={d.name} doc={d} value={attrs[RK.doc(d.name)] ?? "unknown"} onChange={setAttr(RK.doc(d.name))} />
              ))}
            </div>
          </AccSection>
        ) : null}

        <AccSection n={5} title="유해물질·퇴비화 상태" desc="부품 단위 시험성적서 확보 여부" summary={summary.soc} open={!!open.soc} onToggle={() => toggle("soc")} onOpen={() => openOne("soc")}>
          <Grid>
            <StatusSelect label="PFAS" value={f.pfas_status} onChange={set("pfas_status")} />
            <StatusSelect label="중금속" value={f.heavy_metal_status} onChange={set("heavy_metal_status")} />
            <StatusSelect label="퇴비화" value={f.compostability_status} onChange={set("compostability_status")} />
          </Grid>
        </AccSection>
      </fieldset>

      {children}
    </form>
  );
}

/* ---------- 선택 섹션 아코디언 ---------- */
function AccSection({
  n, title, desc, summary, open, onToggle, onOpen, children,
}: {
  n: number; title: string; desc: string; summary: string;
  open: boolean; onToggle: () => void; onOpen: () => void; children: ReactNode;
}) {
  const done = summary.length > 0;
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onToggle())}
        className="flex cursor-pointer items-center gap-3.5 px-6 py-4 hover:bg-slate-50"
      >
        <div className={"flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg text-[13px] font-bold " + (done ? "bg-primary-soft text-primary" : "bg-slate-100 text-slate-400")}>
          {done ? "✓" : n}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-bold text-ink">{title}</span>
            {done ? (
              <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10.5px] font-bold text-primary">입력됨</span>
            ) : (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10.5px] font-bold text-amber-600">선택 · 정확도↑</span>
            )}
          </div>
          <p className={"mt-0.5 truncate text-[12.5px] " + (done ? "text-slate-500" : "text-slate-400")}>
            {done ? summary : `아직 입력 안 함 — ${desc}`}
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
          className="shrink-0 rounded-lg border border-slate-300 px-3.5 py-1.5 text-[12.5px] font-semibold text-slate-600 hover:border-primary hover:text-primary"
        >
          {done ? "수정" : "입력"}
        </button>
        <ChevronDown className={"h-4 w-4 shrink-0 text-slate-400 transition-transform " + (open ? "rotate-180" : "")} />
      </div>
      {open && <div className="border-t border-slate-100 px-6 pb-6 pt-4">{children}</div>}
    </section>
  );
}

/* ---------- 유형별 상세 필드 렌더러 ---------- */
function SpecInput({ field, value, onChange }: { field: SpecField; value: string; onChange: (v: string) => void }) {
  const label = (
    <Label>
      {field.label}
      {field.axis && <span className="axis">{AXIS_LABEL[field.axis]}</span>}
      {field.hint && <span className="hint">{field.hint}</span>}
    </Label>
  );
  if (field.type === "text")
    return <div>{label}<input value={value} onChange={(e) => onChange(e.target.value)} placeholder="입력" className={inputCls} /></div>;
  if (field.type === "number")
    return (
      <div>{label}
        <div className="flex gap-2">
          <input type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0" className={inputCls} />
          {field.unit && <span className="flex items-center rounded-lg border border-slate-300 bg-slate-50 px-3 font-mono text-xs text-slate-500">{field.unit}</span>}
        </div>
      </div>
    );
  if (field.type === "bool")
    return (
      <div>{label}
        <div className="flex overflow-hidden rounded-lg border border-slate-300">
          {[["true", "예"], ["false", "아니오"]].map(([v, l]) => (
            <button key={v} type="button" onClick={() => onChange(v)}
              className={"flex-1 py-2.5 text-sm font-semibold " + (value === v ? "bg-primary-soft text-primary" : "bg-white text-slate-500")}>
              {l}
            </button>
          ))}
        </div>
      </div>
    );
  // select
  return (
    <div>{label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls + " bg-white " + (value ? "" : "text-slate-300")}>
        <option value="">선택</option>
        {field.options!.map((o) => <option key={o} value={o} className="text-slate-700">{o}</option>)}
      </select>
    </div>
  );
}

/* ---------- 첨부문서 체크리스트 행 ---------- */
function DocRow({ doc, value, onChange }: { doc: SpecDoc; value: string; onChange: (v: string) => void }) {
  const required = doc.requirement === "필수";
  return (
    <div
      className={
        "grid gap-3 rounded-xl border p-4 sm:grid-cols-[1fr_180px] " +
        (required ? "border-l-4 border-l-danger border-slate-200" : "border-l-4 border-l-amber-400 border-slate-200")
      }
    >
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-ink">{doc.name}</span>
          <span
            className={
              "rounded-full px-2 py-0.5 text-[10px] font-bold " +
              (required ? "bg-red-50 text-danger" : "bg-amber-50 text-amber-600")
            }
          >
            {doc.requirement}
          </span>
        </div>
        {doc.purpose && <p className="mt-1 text-xs leading-relaxed text-slate-400">{doc.purpose}</p>}
      </div>
      <div className="self-center">
        <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls + " bg-white"}>
          {DATA_STATUS.map((s) => (
            <option key={s.v} value={s.v}>
              {s.l}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/* ---------- 프리미티브 ---------- */
function Section({ title, desc, children }: { title: string; desc: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-8 md:grid-cols-[300px_1fr]">
      <div>
        <h2 className="text-lg font-bold text-ink">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{desc}</p>
      </div>
      <div>{children}</div>
    </section>
  );
}
function Grid({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}
function Label({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 flex flex-wrap items-center gap-1.5 text-sm font-semibold text-slate-700">
      {children} {required && <span className="text-danger">*</span>}
      <style>{`.axis{font-family:ui-monospace,monospace;font-size:9.5px;font-weight:700;background:#e2f1ec;color:#2f7d6b;padding:1px 6px;border-radius:5px}
        .hint{width:100%;font-weight:400;font-size:11.5px;color:#94a3a0;margin-top:-1px}`}</style>
    </label>
  );
}
const inputCls = "w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none placeholder:text-slate-300 focus:border-primary disabled:bg-slate-50 disabled:text-slate-400";
function Field({ label, value, onChange, required, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean; type?: string; placeholder?: string;
}) {
  return (
    <div><Label required={required}>{label}</Label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls} /></div>
  );
}
function Select({ label, value, onChange, options, required }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; required?: boolean;
}) {
  return (
    <div><Label required={required}>{label}</Label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls + " bg-white " + (value ? "" : "text-slate-300")}>
        <option value="">선택</option>
        {options.map((o) => <option key={o} value={o} className="text-slate-700">{o}</option>)}
      </select></div>
  );
}
function StatusSelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div><Label>{label}</Label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls + " bg-white"}>
        {DATA_STATUS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
      </select></div>
  );
}
