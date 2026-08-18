/**
 * 부품 상세 속성의 저장/복원 + 완료율·상태 파생.
 *
 * ⚠️ ppwr.ComponentMaster 에 attributes(JSONB) 컬럼이 아직 없다. 그래서 시안이 요구하는
 *    필드 대부분(부품명 국문, 포장 단계, 치수, 유형 전용 입력 …)을 material_summary(TEXT)에
 *    JSON 으로 직렬화해 보관한다. 예약 키는 `__` 프리픽스를 쓰고, 유형 전용 필드는
 *    스펙의 field.key 를 그대로 쓴다.
 *
 *    → attributes 컬럼이 생기면 decodeAttrs/encodeAttrs 두 함수만 갈아끼우면 된다.
 *      기존 데이터(구버전 `__sub_type` 등)도 같은 키를 쓰므로 그대로 읽힌다.
 */

import {
  specForType,
  type ComponentTypeSpec,
  type SpecField,
} from "./ppwr-component-spec";

/**
 * 폼 상태에서 다중값(multiselect·사진 목록)을 한 문자열에 담을 때 쓰는 구분자.
 * JSON 으로 나갈 때는 배열로 펴지므로 저장 포맷에는 나타나지 않는다.
 * 선택지 라벨에 `|` 를 쓰지 않는 것이 전제다.
 */
export const MULTI_SEP = "|";

/** material_summary JSON 의 예약 키 (유형 전용 필드와 충돌하지 않도록 `__` 프리픽스) */
export const AK = {
  nameKo: "__name_ko",
  packagingLevel: "__packaging_level",
  bomId: "__bom_id",
  subType: "__sub_type",
  elementStructure: "__element_structure",
  supplier: "__supplier",
  qtyPerProduct: "__qty_per_product",
  materialGroup: "__material_group",
  materialDetail: "__material_detail",
  grade: "__grade",
  materialStructure: "__material_structure",
  unitWeight: "__unit_weight",
  weightUnit: "__weight_unit",
  weightSource: "__weight_source",
  dimW: "__dim_w",
  dimH: "__dim_h",
  dimD: "__dim_d",
  dimUnit: "__dim_unit",
  hasMetal: "__has_metal",
  separability: "__separability",
  photos: "__photos",
} as const;

/** 폼/상세가 다루는 값. 모두 문자열로 보관하고 저장 시점에만 형변환한다. */
export type ComponentAttrs = Record<string, string>;

/** material_summary(JSON 문자열) → 속성 맵 */
export function decodeAttrs(materialSummary: string | null | undefined): ComponentAttrs {
  const raw = (materialSummary ?? "").trim();
  if (!raw.startsWith("{")) return {};
  try {
    const obj = JSON.parse(raw) as Record<string, unknown>;
    const out: ComponentAttrs = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v == null) continue;
      out[k] = Array.isArray(v) ? v.join(MULTI_SEP) : String(v);
    }
    return out;
  } catch {
    return {};
  }
}

/** 속성 맵 → material_summary(JSON 문자열). 빈 값은 버린다. */
export function encodeAttrs(attrs: ComponentAttrs, spec?: ComponentTypeSpec): string | null {
  const out: Record<string, unknown> = {};
  const numericKeys = new Set((spec?.fields ?? []).filter((f) => f.type === "number").map((f) => f.key));
  const multiKeys = new Set((spec?.fields ?? []).filter((f) => f.type === "multiselect").map((f) => f.key));

  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === "") continue;
    if (multiKeys.has(k) || k === AK.photos) {
      const list = v.split(MULTI_SEP).filter(Boolean);
      if (list.length) out[k] = list;
      continue;
    }
    if (numericKeys.has(k)) {
      const n = Number(v);
      out[k] = Number.isFinite(n) ? n : v;
      continue;
    }
    out[k] = v;
  }
  return Object.keys(out).length ? JSON.stringify(out) : null;
}

/** multiselect / photos 처럼 여러 값을 담는 키를 배열로 읽기 */
export function attrList(attrs: ComponentAttrs, key: string): string[] {
  return (attrs[key] ?? "").split(MULTI_SEP).filter(Boolean);
}

/* ────────────────────────── 필수 입력 완료율 ────────────────────────── */

/** 유형과 무관하게 항상 필수인 기본 항목 (시안에서 * 표시된 것) */
const ALWAYS_REQUIRED: { key: string; label: string; fromColumn?: "name" }[] = [
  { key: "name", label: "부품명 (영문)", fromColumn: "name" },
  { key: AK.packagingLevel, label: "포장 단계" },
  { key: AK.subType, label: "세부 포장 형태" },
  { key: AK.elementStructure, label: "구성요소 구조" },
  { key: AK.supplier, label: "공급사" },
  { key: AK.qtyPerProduct, label: "제품당 사용수량" },
  { key: AK.materialGroup, label: "재질군" },
  { key: AK.materialDetail, label: "상세 재질명" },
  { key: AK.materialStructure, label: "구조 구분" },
  { key: AK.unitWeight, label: "개당 중량" },
  { key: AK.dimW, label: "치수 (W)" },
  { key: AK.dimH, label: "치수 (H)" },
  { key: AK.dimD, label: "치수 (D)" },
  { key: AK.separability, label: "분리 여부" },
];

export type MissingItem = { key: string; label: string };

/**
 * 필수 입력 누락 목록. 목록 카드의 "누락항목 n개" 와 폼 상단 "필수 입력 완료율"이 같은 값을 쓴다.
 * name 만 컬럼이고 나머지는 attrs 에서 읽는다.
 */
export function missingRequired(
  master: { name: string; type: string | null },
  attrs: ComponentAttrs,
): MissingItem[] {
  const missing: MissingItem[] = [];
  for (const item of ALWAYS_REQUIRED) {
    const value = item.fromColumn === "name" ? master.name : attrs[item.key];
    if (!value || !String(value).trim()) missing.push({ key: item.key, label: item.label });
  }
  const spec = specForType(master.type);
  for (const f of spec?.fields ?? []) {
    if (!f.required) continue;
    if (!attrs[f.key] || !attrs[f.key].trim()) missing.push({ key: f.key, label: f.label });
  }
  return missing;
}

/** 필수 입력 완료율 0~100 */
export function requiredCompletion(
  master: { name: string; type: string | null },
  attrs: ComponentAttrs,
): number {
  const spec = specForType(master.type);
  const total = ALWAYS_REQUIRED.length + (spec?.fields ?? []).filter((f) => f.required).length;
  if (total === 0) return 100;
  const missing = missingRequired(master, attrs).length;
  return Math.round(((total - missing) / total) * 100);
}

/* ────────────────────────── 첨부 문서 상태 ────────────────────────── */

/** 시안 배지: 미제출 / 검토 대기 / 보완 필요 / 부적합 / 적합 */
export type DocState = "not_submitted" | "in_review" | "needs_supplement" | "rejected" | "approved";

export const DOC_STATE_LABEL: Record<DocState, string> = {
  not_submitted: "미제출",
  in_review: "검토 대기",
  needs_supplement: "보완 필요",
  rejected: "부적합",
  approved: "적합",
};

export const DOC_STATE_CLASS: Record<DocState, string> = {
  not_submitted: "bg-slate-100 text-slate-500",
  in_review: "bg-amber-50 text-amber-700",
  needs_supplement: "bg-amber-50 text-amber-700",
  rejected: "bg-red-50 text-danger",
  approved: "bg-emerald-50 text-emerald-700",
};

/**
 * 문서 종류별 상태 = 그 종류로 올라온 EvidenceDocument row 들의 상태를 합친 값.
 * row 가 없으면 미제출. 하나라도 부적합/보완필요면 그쪽이 이긴다(가장 나쁜 상태 우선).
 * 상태 자체는 관리자 검수 결과라 프론트에서 바꾸지 않는다 — 업로드는 항상 in_review 로 들어간다.
 */
export function docStateFrom(statuses: string[]): DocState {
  if (statuses.length === 0) return "not_submitted";
  if (statuses.some((s) => s === "rejected")) return "rejected";
  if (statuses.some((s) => s === "needs_supplement")) return "needs_supplement";
  if (statuses.every((s) => s === "approved")) return "approved";
  return "in_review";
}

/** 첨부 문서 확보율 0~100 — 필수 문서 중 '적합' 비율 (필수 문서가 없으면 전체 기준) */
export function docCompletion(states: { required: boolean; state: DocState }[]): number {
  const pool = states.filter((s) => s.required);
  const target = pool.length ? pool : states;
  if (target.length === 0) return 100;
  const ok = target.filter((s) => s.state === "approved").length;
  return Math.round((ok / target.length) * 100);
}

/* ────────────────────────── 부품 진단 상태 ────────────────────────── */

/** 목록 탭·카드 배지에 쓰는 부품 상태 */
export type ComponentState = "draft" | "undiagnosed" | "needs_supplement" | "compliant";

export const COMPONENT_STATE_LABEL: Record<ComponentState, string> = {
  draft: "작성중",
  undiagnosed: "미진단",
  needs_supplement: "보완 필요",
  compliant: "적합",
};

export const COMPONENT_STATE_CLASS: Record<ComponentState, string> = {
  draft: "bg-slate-100 text-slate-500",
  undiagnosed: "bg-sky-50 text-sky-600",
  needs_supplement: "bg-amber-50 text-amber-700",
  compliant: "bg-emerald-50 text-emerald-700",
};

/**
 * 부품 상태 파생. ComponentMaster 에 status 컬럼이 없어서 입력 완료도 + 문서 상태로 계산한다.
 *   필수 입력 미완료            → 작성중
 *   필수 문서에 부적합/보완필요  → 보완 필요
 *   필수 문서 전부 적합          → 적합
 *   그 외(올렸지만 검토 전 등)   → 미진단
 */
export function deriveComponentState(
  completion: number,
  docStates: { required: boolean; state: DocState }[],
): ComponentState {
  if (completion < 100) return "draft";
  const required = docStates.filter((d) => d.required);
  if (required.some((d) => d.state === "rejected" || d.state === "needs_supplement")) {
    return "needs_supplement";
  }
  if (required.length > 0 && required.every((d) => d.state === "approved")) return "compliant";
  return "undiagnosed";
}

/** 유형 전용 필드 값을 사람이 읽는 문자열로 (상세 화면 표시용) */
export function displayFieldValue(field: SpecField, attrs: ComponentAttrs): string {
  const raw = attrs[field.key];
  if (!raw) return "—";
  if (field.type === "multiselect") return attrList(attrs, field.key).join(", ") || "—";
  if (field.type === "number") return field.unit ? `${raw} ${field.unit}` : raw;
  return raw;
}

/* ────────────── 문서 상태 → ComponentMaster 전용 컬럼 동기화 ────────────── */

/**
 * 첨부문서 체크리스트에 대응하는 기존 컬럼들.
 * 이 세 컬럼은 이미 스키마에 있으니 문서 상태에서 파생시켜 같이 갱신한다.
 * (안 하면 폼에서 사라진 뒤 값이 옛날 상태로 굳어버린다)
 */
const DOC_TO_COLUMN: { doc: string; column: "pfas_status" | "heavy_metal_status" | "compostability_status" }[] = [
  { doc: "PFAS 적합성 자료", column: "pfas_status" },
  { doc: "4대 중금속 DoC 또는 시험성적서", column: "heavy_metal_status" },
  { doc: "퇴비화 인증(EN 13432 등)", column: "compostability_status" },
];

/** DocState → 기존 컬럼이 쓰던 4값 체계 */
function docStateToColumnValue(state: DocState): string {
  switch (state) {
    case "approved":
      return "provided";
    case "needs_supplement":
    case "rejected":
      return "need_check";
    case "not_submitted":
      return "not_available";
    default:
      return "unknown";
  }
}

/** 문서 체크리스트 상태에서 pfas/중금속/퇴비화 컬럼값을 만든다 */
export function statusColumnsFromDocs(
  docStates: { name: string; state: DocState }[],
): { pfas_status: string; heavy_metal_status: string; compostability_status: string } {
  const out = {
    pfas_status: "unknown",
    heavy_metal_status: "unknown",
    compostability_status: "unknown",
  };
  for (const { doc, column } of DOC_TO_COLUMN) {
    const found = docStates.find((d) => d.name === doc);
    // 이 유형에 해당 문서가 없으면 '해당 자료 없음'이 아니라 '모름'으로 둔다
    if (found) out[column] = docStateToColumnValue(found.state);
  }
  return out;
}
