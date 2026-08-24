/**
 * ppwr.Product 에 컬럼이 없는 소수 항목의 저장/복원 + 필수 입력 완료율.
 *
 * Product 는 컬럼이 거의 다 있어서 부품과 달리 JSON 으로 뺄 게 별로 없다.
 * 남는 것만 memo(TEXT)에 JSON 으로 넣는다. memo 가 JSON 이 아니면(수기 메모 등)
 * 그대로 두고 빈 속성으로 읽어 기존 값을 깨뜨리지 않는다.
 */

import { MULTI_SEP } from "./ppwr-component-attrs";
import type { DocState } from "./ppwr-component-attrs";

/** memo JSON 의 예약 키 */
export const PK = {
  photos: "__photos",
  foodContact: "__food_contact",
  /** EU 연간 예상 수량의 단위 — Product 에 대응 컬럼이 없어 memo 로 간다 */
  euVolumeUnit: "__eu_volume_unit",
} as const;

export type ProductAttrs = Record<string, string>;

export function decodeProductAttrs(memo: string | null | undefined): ProductAttrs {
  const raw = (memo ?? "").trim();
  if (!raw.startsWith("{")) return {};
  try {
    const obj = JSON.parse(raw) as Record<string, unknown>;
    const out: ProductAttrs = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v == null) continue;
      out[k] = Array.isArray(v) ? v.join(MULTI_SEP) : String(v);
    }
    return out;
  } catch {
    return {};
  }
}

export function encodeProductAttrs(attrs: ProductAttrs): string | null {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === "") continue;
    if (k === PK.photos) {
      const list = v.split(MULTI_SEP).filter(Boolean);
      if (list.length) out[k] = list;
      continue;
    }
    out[k] = v;
  }
  return Object.keys(out).length ? JSON.stringify(out) : null;
}

export function productAttrList(attrs: ProductAttrs, key: string): string[] {
  return (attrs[key] ?? "").split(MULTI_SEP).filter(Boolean);
}

/* ────────────────────────── 필수 입력 완료율 ────────────────────────── */

/**
 * 시안에서 * 표시된 항목. 제품은 부품보다 필수가 훨씬 적다.
 * 나머지는 "모름/미입력"을 허용하고 진단 리포트에서 누락자료로 잡는 것이 PPWR 흐름이다.
 */
const REQUIRED: { key: string; label: string }[] = [
  { key: "name", label: "제품명 (영문)" },
  { key: "category", label: "제품 카테고리" },
];

/**
 * 진단에 실제로 필요한 권장 항목. 필수는 아니지만 비어 있으면
 * 목록 카드의 "누락항목"으로 센다 (유료 전환 근거가 되는 값들).
 */
const RECOMMENDED: { key: string; label: string }[] = [
  { key: "manufacturing_country", label: "제조 국가" },
  { key: "net_weight", label: "제품 Net 중량" },
  { key: "gross_weight", label: "최종 포장 Gross 중량" },
  { key: "eu_market_status", label: "EU 시장 출시 형태" },
  { key: "eu_launch_countries", label: "EU 판매 예정국가" },
];

type ProductLike = Record<string, unknown>;

function filled(p: ProductLike, key: string): boolean {
  const v = p[key];
  if (v == null) return false;
  if (typeof v === "string") return v.trim() !== "";
  return true;
}

export function missingRequiredProduct(p: ProductLike): { key: string; label: string }[] {
  return REQUIRED.filter((r) => !filled(p, r.key));
}

/** 목록 카드의 "누락항목 n개" — 필수 + 권장 중 비어 있는 것 */
export function missingProductItems(p: ProductLike): { key: string; label: string }[] {
  return [...REQUIRED, ...RECOMMENDED].filter((r) => !filled(p, r.key));
}

/** 필수 입력 완료율 0~100 (필수 + 권장 기준) */
export function productCompletion(p: ProductLike): number {
  const total = REQUIRED.length + RECOMMENDED.length;
  return Math.round(((total - missingProductItems(p).length) / total) * 100);
}

/** 첨부 문서 확보율에 쓰는 형태로 변환 */
export type ProductDocState = { required: boolean; state: DocState };
