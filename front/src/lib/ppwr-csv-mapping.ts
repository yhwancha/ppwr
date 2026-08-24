import { CSV_COLUMNS, type CsvColumn } from "./ppwr-product-spec";

/**
 * CSV 헤더 → 제품 필드 자동 매핑.
 *
 * 고객사마다 CSV 양식이 제각각이라 "템플릿을 받아서 그대로 채워 오라"는 요구가 현실에서
 * 잘 지켜지지 않는다. 그래서 어떤 헤더로 와도 우리 필드로 붙여 준다.
 *
 * 2단계로 동작한다:
 *   1. 규칙 기반(heuristicMap) — 정규화 + 동의어 + 토큰 겹침 점수. 네트워크·키가 필요 없다.
 *   2. AI 보강(/api/csv-mapping) — 1단계가 못 붙인 헤더만 넘겨서 판단을 받는다.
 *      키가 없거나 실패하면 1단계 결과를 그대로 쓴다. 즉 AI 는 있으면 좋은 것이지 전제가 아니다.
 *
 * 값 정규화(normalizeValue)도 함께 한다. 헤더를 맞춰도 "Y/N vs 예/아니오",
 * "2026.09.01 vs 09/01/2026", "DE;FR vs 독일;프랑스" 가 다르면 못 넣는다.
 */

/** 매핑 대상 필드 1건 */
export type ImportField = CsvColumn & { synonyms: string[] };

/** 괄호 안까지 살린 정규화 — "제품명(국문)" 과 "제품명(영문)" 을 가른다 */
export function normFull(s: string): string {
  return s.toLowerCase().replace(/[\s_\-./·()]/g, "").replace(/[^\p{L}\p{N}]/gu, "").trim();
}

/** 비교용 정규화 — 대소문자·공백·구두점·괄호주석 제거 */
export function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")   // "Net Weight (g)" → "net weight"
    .replace(/[\s_\-./·]/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "")
    .trim();
}

/**
 * 필드별 동의어. 실제 고객사 CSV 에서 본 표기를 모아 둔다.
 * 헤더가 여기 없더라도 토큰 겹침으로 붙을 수 있고, 그래도 안 되면 AI 로 넘어간다.
 */
const SYNONYMS: Record<string, string[]> = {
  name: ["product name", "productname", "item name", "품명", "제품명", "상품명", "영문명", "name(en)", "english name"],
  name_ko: ["korean name", "품명(국문)", "제품명국문", "국문명", "한글명", "name(ko)"],
  sku: ["sku code", "skuno", "품번", "제품코드", "상품코드", "item code", "itemcode", "article no"],
  model_name: ["model", "모델", "모델명", "model no", "modelno"],
  category: ["category", "제품군", "품목분류", "분류", "카테고리", "product category", "type"],
  identifier_no: ["barcode", "gtin", "ean", "바코드", "식별번호", "제품식별번호"],
  manufacturing_country: ["country of origin", "origin", "made in", "제조국", "원산지", "생산국"],
  hs_code: ["hs", "hscode", "hs코드", "관세코드", "tariff code"],
  content_form: ["form", "내용물", "제형", "content type", "형태"],
  storage_condition: ["storage", "보관", "보관조건", "storage temp"],
  net_weight: ["net weight", "netweight", "내용량", "제품중량", "순중량", "중량"],
  net_weight_unit: ["net weight unit", "중량단위", "weight unit"],
  net_width: ["net width", "width", "가로", "w"],
  net_height: ["net height", "height", "세로", "h"],
  net_depth: ["net depth", "depth", "높이", "d", "두께"],
  net_dim_unit: ["dimension unit", "치수단위", "dim unit"],
  gross_weight: ["gross weight", "grossweight", "총중량", "포장중량", "배송중량", "박스중량", "박스 중량", "출고중량", "carton weight"],
  gross_weight_unit: ["gross weight unit", "총중량단위"],
  gross_width: ["gross width", "포장가로", "박스가로", "carton width"],
  gross_height: ["gross height", "포장세로", "박스세로"],
  gross_depth: ["gross depth", "포장높이", "박스높이"],
  gross_dim_unit: ["gross dimension unit", "포장치수단위"],
  eu_market_status: ["eu status", "eu출시상태", "출시상태", "eu시장", "market status"],
  eu_launch_date: ["eu launch", "launch date", "출시일", "출시예정일", "런칭일"],
  eu_launch_countries: ["eu countries", "판매국가", "수출국", "target countries", "countries"],
  eu_annual_volume: ["annual volume", "연간수량", "연간물량", "예상수량", "yearly qty", "qty/year"],
  __food_contact: ["food contact", "식품접촉", "식품접촉여부"],
  contact_sensitive: ["contact sensitive", "피부접촉", "민감접촉"],
};

/** 매핑 후보 필드 목록 — CSV_COLUMNS 에 동의어를 얹는다 */
export const IMPORT_FIELDS: ImportField[] = CSV_COLUMNS.map((c) => {
  const key = c.column ?? c.attrKey ?? c.header;
  return { ...c, synonyms: SYNONYMS[key] ?? [] };
});

/** 필드를 가리키는 안정적인 키 (컬럼명 또는 attr 키) */
export function fieldKey(f: CsvColumn): string {
  return f.column ?? f.attrKey ?? f.header;
}

export type Mapping = {
  /** CSV 헤더 원문 */
  header: string;
  /** 붙은 필드 키. null 이면 무시 */
  field: string | null;
  /** heuristic | ai | manual | none */
  by: "heuristic" | "ai" | "manual" | "none";
  /** 0–1. 사용자에게 확인이 필요한지 판단하는 데 쓴다 */
  score: number;
};

/** 두 문자열의 토큰 겹침 비율 (0–1) */
function overlap(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.85;
  const A = new Set(a.split(""));
  const B = new Set(b.split(""));
  let hit = 0;
  for (const ch of A) if (B.has(ch)) hit++;
  return hit / Math.max(A.size, B.size);
}

/**
 * 규칙 기반 매핑. 네트워크 없이 즉시 동작한다.
 * 한 필드에 여러 헤더가 붙지 않도록 점수가 높은 쪽이 가져간다.
 */
export function heuristicMap(headers: string[]): Mapping[] {
  const taken = new Set<string>();

  // 헤더마다 전체 후보를 점수순으로 들고 있는다.
  // 1순위가 이미 선점됐으면 2순위로 내려가야 "중량(g)"과 "박스 중량(g)"이 각각 붙는다.
  const scored = headers.map((h) => {
    const nf = normFull(h);
    const nh = norm(h);
    const ranked = IMPORT_FIELDS.map((f) => {
      const key = fieldKey(f);
      const cands = [f.header, key, ...f.synonyms];
      // 괄호까지 살린 비교를 먼저 본다 — "제품명(국문)" 이 name 으로 가지 않게
      const full = Math.max(...cands.map((c) => overlap(nf, normFull(c))));
      const loose = Math.max(...cands.map((c) => overlap(nh, norm(c))));
      return { key, score: Math.max(full, loose * 0.98) };
    }).sort((a, b) => b.score - a.score);
    return { header: h, ranked };
  });

  // 최고 점수 헤더부터 필드를 선점하고, 막히면 차선으로 내려간다
  return scored
    .map((s, i) => ({ ...s, i }))
    .sort((a, b) => (b.ranked[0]?.score ?? 0) - (a.ranked[0]?.score ?? 0))
    .map((s) => {
      const pick = s.ranked.find((r) => r.score >= 0.6 && !taken.has(r.key));
      if (pick) taken.add(pick.key);
      return {
        i: s.i,
        m: {
          header: s.header,
          field: pick?.key ?? null,
          by: (pick ? "heuristic" : "none") as Mapping["by"],
          score: pick?.score ?? s.ranked[0]?.score ?? 0,
        },
      };
    })
    .sort((a, b) => a.i - b.i)
    .map((x) => x.m);
}

/**
 * "규격" · "Dimensions (WxHxD)" 처럼 한 칸에 치수 3개가 들어 있는 헤더인지.
 * 이런 컬럼은 하나의 필드로 붙이면 안 되고 W/H/D 로 펴야 한다.
 */
export function isCombinedDimHeader(header: string, sample: string | undefined): boolean {
  const h = norm(header);
  const looksLikeHeader = /치수|규격|dimension|dimensions|size|사이즈/.test(h);
  const looksLikeValue = Boolean(sample && splitDims(sample));
  return looksLikeHeader && looksLikeValue;
}

/* ────────────────────────── 값 정규화 ────────────────────────── */

const YES = new Set(["y", "yes", "true", "1", "o", "예", "있음", "해당"]);
const NO = new Set(["n", "no", "false", "0", "x", "아니오", "아니요", "없음", "해당없음"]);

/** ISO 2자리 국가코드 → 한글명. EU 판매국가가 코드로 오는 경우가 많다. */
const COUNTRY_KO: Record<string, string> = {
  de: "독일", fr: "프랑스", it: "이탈리아", es: "스페인", nl: "네덜란드",
  be: "벨기에", pl: "폴란드", se: "스웨덴", at: "오스트리아", dk: "덴마크",
  fi: "핀란드", ie: "아일랜드", pt: "포르투갈", cz: "체코", gr: "그리스",
};

/** "48g", "1,200", "12 000" 처럼 단위·구분자가 섞인 수치에서 숫자만 뽑는다 */
function toNumber(raw: string): number | null {
  const m = raw.replace(/[,\s]/g, "").match(/-?\d+(\.\d+)?/);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) ? n : null;
}

/** 2026.09.01 · 09/01/2026 · 20260901 등을 YYYY-MM-DD 로 */
function toDate(raw: string): string | null {
  const s = raw.trim();
  let m = s.match(/^(\d{4})[.\-/]?(\d{1,2})[.\-/]?(\d{1,2})$/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  // MM/DD/YYYY (미국식) — 앞 숫자가 12 이하이고 뒤가 4자리면 이 형태로 본다
  m = s.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})$/);
  if (m && Number(m[1]) <= 12) {
    return `${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
  }
  return null;
}

/** "DE;FR" · "DE, FR" · "독일/프랑스" → "독일;프랑스" */
function toCountries(raw: string): string {
  return raw
    .split(/[;,/|]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => COUNTRY_KO[s.toLowerCase()] ?? s)
    .join(";");
}

/**
 * "120x90x60" 처럼 한 칸에 합쳐 온 치수를 분해한다.
 * 헤더에 W/H/D 가 따로 없을 때 이 값을 3개 필드로 편다.
 */
export function splitDims(raw: string): { w: number; h: number; d: number } | null {
  const parts = raw.split(/[x×*]/i).map((p) => toNumber(p));
  if (parts.length !== 3 || parts.some((p) => p == null)) return null;
  return { w: parts[0] as number, h: parts[1] as number, d: parts[2] as number };
}

/** 필드 종류에 맞춰 셀 값을 변환한다. 못 바꾸면 null → 그 셀은 비운다. */
export function normalizeValue(field: CsvColumn, raw: string): string | number | boolean | null {
  const v = (raw ?? "").trim();
  if (!v) return null;

  switch (field.kind) {
    case "number":
      return toNumber(v);
    case "date":
      return toDate(v);
    case "yesno": {
      const l = v.toLowerCase();
      if (YES.has(l)) return true;
      if (NO.has(l)) return false;
      return null;
    }
    default:
      if (fieldKey(field) === "eu_launch_countries") return toCountries(v);
      return v;
  }
}
