/**
 * 제품 등록·수정 폼의 선택지 / 필수 항목 / 첨부문서 / CSV 템플릿 정의.
 *
 * Figma "제품 등록 페이지" 시안의 섹션 구성을 그대로 따른다:
 *   기본 제품 정보 · 제조 및 규제 코드 · 제품 물성 정보 · 최종 포장 정보 ·
 *   EU 시장 출시 계획 · 기타 · 첨부 문서
 *
 * 부품(ComponentMaster)과 달리 ppwr.Product 는 컬럼이 거의 다 갖춰져 있어서
 * 대부분 실제 컬럼에 저장되고, 컬럼이 없는 소수 항목만 memo(JSON)로 간다.
 * (→ ppwr-product-attrs.ts)
 */

import type { SpecDoc } from "./ppwr-component-spec";

export const PRODUCT_CATEGORIES = [
  "화장품 / 뷰티",
  "식품",
  "음료",
  "생활소비재",
  "의약외품",
  "의류 / 패션",
  "전자제품",
  "완구",
  "기타",
] as const;

export const MANUFACTURING_COUNTRIES = [
  "대한민국",
  "중국",
  "베트남",
  "일본",
  "미국",
  "독일",
  "이탈리아",
  "프랑스",
  "폴란드",
  "기타",
] as const;

export const CONTENT_FORMS = ["액상", "젤 / 크림", "고체", "분말", "과립", "에어로졸", "냉동식품", "기타"] as const;

export const STORAGE_CONDITIONS = ["상온", "냉장", "냉동", "직사광선 차단", "기타"] as const;

/** EU 시장 출시 형태 (ppwr.Product.eu_market_status) */
export const EU_MARKET_STATUS = [
  "이미 출시함",
  "출시 예정",
  "검토 중",
  "출시 계획 없음",
] as const;

/** EU 27개 회원국 — 판매 예정국가 다중 선택 */
export const EU_COUNTRIES = [
  "그리스", "네덜란드", "덴마크", "독일", "라트비아", "루마니아", "룩셈부르크", "리투아니아",
  "몰타", "벨기에", "불가리아", "스웨덴", "스페인", "슬로바키아", "슬로베니아", "아일랜드",
  "에스토니아", "오스트리아", "이탈리아", "체코", "크로아티아", "키프로스", "포르투갈",
  "폴란드", "프랑스", "핀란드", "헝가리",
] as const;

export const WEIGHT_UNITS = ["g", "kg", "mg"] as const;
export const DIM_UNITS = ["mm", "cm"] as const;

export const YES_NO = ["예", "아니오"] as const;

/**
 * 제품 단위 첨부 문서.
 * ⚠️ 시안의 제품 등록 화면에는 부품 쪽과 같은 3종이 그려져 있어 그대로 따랐다.
 *    (제품 단위 문서로는 포장 최소화 근거·라벨링 시안 등이 더 맞을 수 있어 확인이 필요하다)
 */
export const PRODUCT_DOCS: SpecDoc[] = [
  {
    name: "부품 도면·단면도",
    required: true,
    purpose: "치수, 벽 구조, 이중벽·내부용기 및 Packaging Unit 구성을 확인",
  },
  {
    name: "원료 TDS 또는 재질 사양서",
    required: true,
    purpose: "상세 재질, Grade, 물성 및 공급사 정보를 확인",
  },
  {
    name: "4대 중금속 DoC 또는 시험성적서",
    required: true,
    purpose: "Article 5의 납·카드뮴·수은·6가크롬 관리 근거 확인",
  },
];

/** 제품 상태 (ppwr.Product.status) — 목록 탭·카드 배지 */
export type ProductState = "draft" | "undiagnosed" | "needs_supplement" | "noncompliant" | "compliant";

export const PRODUCT_STATE_LABEL: Record<ProductState, string> = {
  draft: "작성중",
  undiagnosed: "미진단",
  needs_supplement: "보완 필요",
  noncompliant: "부적합",
  compliant: "진단 확정",
};

export const PRODUCT_STATE_CLASS: Record<ProductState, string> = {
  draft: "bg-slate-100 text-slate-500",
  undiagnosed: "bg-sky-50 text-sky-600",
  needs_supplement: "bg-amber-50 text-amber-700",
  noncompliant: "bg-red-50 text-danger",
  compliant: "bg-emerald-50 text-emerald-700",
};

/** 목록 탭 → 어떤 status 를 담을지 */
export const PRODUCT_TAB_STATES: Record<"undiagnosed" | "needs_supplement" | "compliant", ProductState[]> = {
  // 작성중은 아직 진단 전이라 '미진단' 탭에 함께 둔다
  undiagnosed: ["draft", "undiagnosed"],
  needs_supplement: ["needs_supplement", "noncompliant"],
  compliant: ["compliant"],
};

/** 리포트 상태 필터 (ppwr.Report.status 기준) */
export const REPORT_STATUS_OPTIONS = ["발행 완료", "발행 전"] as const;

/* ────────────────────────── CSV 일괄 등록 ────────────────────────── */

/**
 * CSV 템플릿 컬럼.
 *
 * ⚠️ 시안에 "CSV 템플릿 제작 필요"(빨간 라벨)로만 표시되어 있어 확정 스펙이 없다.
 *    여기서는 등록 폼의 입력 항목을 그대로 컬럼으로 폈다. 확정되면 이 배열만 고치면
 *    템플릿 다운로드·업로드 파싱이 함께 따라간다.
 */
export type CsvColumn = {
  header: string;
  /** ppwr.Product 컬럼명. null 이면 memo(JSON) 속성 키 */
  column: string | null;
  attrKey?: string;
  kind: "text" | "number" | "date" | "yesno";
  required?: boolean;
  example: string;
};

export const CSV_COLUMNS: CsvColumn[] = [
  { header: "제품명(영문)", column: "name", kind: "text", required: true, example: "Aether Smartwatch Pro" },
  { header: "제품명(국문)", column: "name_ko", kind: "text", example: "에테르 스마트워치 프로" },
  { header: "SKU", column: "sku", kind: "text", example: "REV-DIR-001" },
  { header: "모델명", column: "model_name", kind: "text", example: "AW-PRO-2026" },
  { header: "제품 카테고리", column: "category", kind: "text", required: true, example: "전자제품" },
  { header: "식별번호", column: "identifier_no", kind: "text", example: "8801234567890" },
  { header: "제조 국가", column: "manufacturing_country", kind: "text", example: "대한민국" },
  { header: "HS Code", column: "hs_code", kind: "text", example: "9102.11" },
  { header: "내용물 형태", column: "content_form", kind: "text", example: "고체" },
  { header: "보관 조건", column: "storage_condition", kind: "text", example: "상온" },
  { header: "Net 중량", column: "net_weight", kind: "number", example: "48" },
  { header: "Net 중량 단위", column: "net_weight_unit", kind: "text", example: "g" },
  { header: "Net 가로(W)", column: "net_width", kind: "number", example: "40" },
  { header: "Net 세로(H)", column: "net_height", kind: "number", example: "46" },
  { header: "Net 높이(D)", column: "net_depth", kind: "number", example: "12" },
  { header: "Net 치수 단위", column: "net_dim_unit", kind: "text", example: "mm" },
  { header: "Gross 중량", column: "gross_weight", kind: "number", example: "210" },
  { header: "Gross 중량 단위", column: "gross_weight_unit", kind: "text", example: "g" },
  { header: "Gross 가로(W)", column: "gross_width", kind: "number", example: "120" },
  { header: "Gross 세로(H)", column: "gross_height", kind: "number", example: "90" },
  { header: "Gross 높이(D)", column: "gross_depth", kind: "number", example: "60" },
  { header: "Gross 치수 단위", column: "gross_dim_unit", kind: "text", example: "mm" },
  { header: "EU 시장 출시 형태", column: "eu_market_status", kind: "text", example: "출시 예정" },
  { header: "EU 출시 예정일", column: "eu_launch_date", kind: "date", example: "2026-09-01" },
  { header: "EU 판매 예정국가", column: "eu_launch_countries", kind: "text", example: "독일;프랑스" },
  { header: "EU 연간 예상 수량", column: "eu_annual_volume", kind: "number", example: "12000" },
  { header: "식품 접촉여부", column: null, attrKey: "__food_contact", kind: "yesno", example: "아니오" },
  { header: "Contact-sensitive 여부", column: "contact_sensitive", kind: "yesno", example: "아니오" },
  { header: "비고", column: "eu_launch_note", kind: "text", example: "" },
];

/** 템플릿 CSV 문자열 (헤더 + 예시 1행). Excel 한글 깨짐 방지를 위해 BOM 을 붙인다. */
export function csvTemplate(): string {
  const header = CSV_COLUMNS.map((c) => c.header).join(",");
  const example = CSV_COLUMNS.map((c) => escapeCsv(c.example)).join(",");
  return `﻿${header}\n${example}\n`;
}

function escapeCsv(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/** 아주 단순한 CSV 파서 (따옴표 감싼 값·이스케이프된 따옴표까지만 처리) */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "").replace(/\r\n?/g, "\n");

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += ch;
      continue;
    }
    if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}
