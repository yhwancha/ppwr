/**
 * 부품(포장재) 유형 체계 + 유형별 입력 필드 · 첨부문서 정의.
 *
 * Figma "부품 관리" 시안 기준:
 *   부품 등록 = ① 포장재 유형 선택 모달 → ② 유형별 등록 폼
 *   폼은 [기본 정보] · [재질 및 구조] · [<유형> 전용 입력] · [첨부 문서] 4섹션이고,
 *   뒤의 두 섹션이 여기 정의를 따라 유형별로 바뀐다.
 *
 * ⚠️ 저장 위치: ppwr.ComponentMaster 에 attributes(JSONB) 컬럼이 아직 없어
 *    유형별 값들을 material_summary(TEXT)에 JSON 으로 직렬화해 보관한다.
 *    직렬화/역직렬화는 ppwr-component-attrs.ts 담당.
 *
 * axis = 어느 PPWR 판정 축에 쓰이는 값인지 (진단 엔진·리포트 참고용)
 *   recy=재활용성 · pcr=재생원료 · soc=유해물질 · reu=재사용 · min=최소화 · lab=라벨링
 */

export type SpecAxis = "recy" | "pcr" | "soc" | "reu" | "min" | "lab";

export const AXIS_LABEL: Record<SpecAxis, string> = {
  recy: "재활용",
  pcr: "재생원료",
  soc: "유해물질",
  reu: "재사용",
  min: "최소화",
  lab: "라벨링",
};

export type SpecField = {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "multiselect" | "bool";
  options?: string[];
  unit?: string;
  hint?: string;
  axis?: SpecAxis;
  required?: boolean;
};

/** 첨부문서 체크리스트 항목 */
export type SpecDoc = {
  name: string;
  required: boolean;
  /** 시안의 "확인 목적: …" 문구 */
  purpose: string;
};

/** 포장재 유형 선택 모달의 카테고리 탭 */
export const TYPE_CATEGORIES = [
  "내용물 직접 포장",
  "개봉·밀봉·토출 부품",
  "표시·보호·고정 부품",
  "외부·운송 포장",
] as const;
export type TypeCategory = (typeof TYPE_CATEGORIES)[number];

export type ComponentTypeSpec = {
  /** ppwr.ComponentMaster.type 에 저장되는 값 */
  key: string;
  category: TypeCategory;
  /** 세부 포장 형태 옵션 */
  subTypes: string[];
  /** 이 유형에서 고를 수 있는 재질군 (MATERIAL_GROUPS 의 키) */
  materialGroups: string[];
  /** 유형 전용 입력 필드 */
  fields: SpecField[];
  docs: SpecDoc[];
};

/* ────────────────────────── 공통 선택지 ────────────────────────── */

/** 포장 단계 — 목록 필터와 등록 폼이 공유 */
export const PACKAGING_LEVELS = ["판매 포장", "묶음 포장", "운송 포장", "이커머스 포장"] as const;

/** 구성요소 구조 */
export const ELEMENT_STRUCTURES = ["단일 부품", "복합 부품", "조립 부품"] as const;

/** 구조 구분 (재질 관점) */
export const MATERIAL_STRUCTURES = ["단일재질", "다층·복합재질", "코팅·라미네이트"] as const;

/** 중량 출처 */
export const WEIGHT_SOURCES = ["실측", "공급사 사양서", "도면", "추정"] as const;

/** 분리 여부 */
export const SEPARABILITY = ["소비자가 분리 가능", "공정에서 분리 가능", "분리 불가", "해당 없음"] as const;

/** 공급사 기본 선택지 (자유 입력도 허용) */
export const SUPPLIER_PRESETS = ["자체 제작", "리베이션"] as const;

/** 재질군 → 상세 재질명 */
export const MATERIAL_GROUPS: { key: string; details: string[] }[] = [
  { key: "플라스틱", details: ["PET", "HDPE", "LDPE", "PP", "PS", "PVC", "PA(나일론)", "EVOH", "PC", "ABS", "기타 플라스틱"] },
  { key: "바이오·생분해 플라스틱", details: ["PLA", "PHA", "전분계", "Bio-PE", "Bio-PET", "기타"] },
  { key: "종이·판지", details: ["백판지", "골판지", "크라프트지", "코팅지", "라미네이트 판지", "기타 지류"] },
  { key: "유리", details: ["소다석회 투명", "소다석회 갈색", "소다석회 녹색", "붕규산", "기타"] },
  { key: "금속", details: ["알루미늄", "주석도금강판(TFS)", "석도강판", "스테인리스", "기타 금속"] },
  { key: "복합재", details: ["종이+PE", "종이+AL+PE", "PET+AL+PE", "PE+EVOH+PE", "기타 다층"] },
  { key: "고무·엘라스토머", details: ["실리콘", "천연고무", "TPE", "기타"] },
  { key: "목재·천연소재", details: ["목재", "코르크", "대나무", "섬유·직물", "기타"] },
];

export const MATERIAL_GROUP_KEYS = MATERIAL_GROUPS.map((g) => g.key);
export function materialDetailsFor(group: string | null | undefined): string[] {
  return MATERIAL_GROUPS.find((g) => g.key === group)?.details ?? [];
}

/* ────────────────────────── 공통 첨부문서 ────────────────────────── */

const DOC_DRAWING: SpecDoc = {
  name: "부품 도면·단면도",
  required: true,
  purpose: "치수, 벽 구조, 이중벽·내부용기 및 Packaging Unit 구성을 확인",
};
const DOC_TDS: SpecDoc = {
  name: "원료 TDS 또는 재질 사양서",
  required: true,
  purpose: "상세 재질, Grade, 물성 및 공급사 정보를 확인",
};
const DOC_HEAVY_METAL: SpecDoc = {
  name: "4대 중금속 DoC 또는 시험성적서",
  required: true,
  purpose: "Article 5의 납·카드뮴·수은·6가크롬 관리 근거 확인",
};
const DOC_PFAS: SpecDoc = {
  name: "PFAS 적합성 자료",
  required: false,
  purpose: "식품접촉 부품의 Article 5(5) 관련 근거 확인",
};
const DOC_PCR: SpecDoc = {
  name: "PCR 공급사 선언·인증자료",
  required: false,
  purpose: "PCR 함량, 공급망 및 Claim 근거 확인",
};
const DOC_FUNCTION: SpecDoc = {
  name: "누액·낙하·차단성 시험",
  required: false,
  purpose: "Article 10에서 구조·중량·부피의 기능적 필요성 소명",
};
const DOC_RECYCLABILITY: SpecDoc = {
  name: "재활용성 평가·설계 가이드 적합성",
  required: false,
  purpose: "Article 6 Design for Recycling 등급 산정 근거 확인",
};
const DOC_COMPOST: SpecDoc = {
  name: "퇴비화 인증(EN 13432 등)",
  required: false,
  purpose: "Article 9 퇴비화 대상 포장의 인증 근거 확인",
};

/** 모든 유형이 공통으로 요구하는 문서 */
const BASE_DOCS: SpecDoc[] = [DOC_DRAWING, DOC_TDS, DOC_HEAVY_METAL];

/* ────────────────────────── 공통 전용 필드 조각 ────────────────────────── */

const F_FOOD_CONTACT: SpecField = {
  key: "food_contact",
  label: "내용물 접촉 여부",
  type: "select",
  options: ["예", "아니오"],
  axis: "soc",
  required: true,
};
const F_ECO_CLAIM: SpecField = {
  key: "eco_claim",
  label: "환경성 Claim 존재",
  type: "select",
  options: ["없음", "재활용 가능", "재생원료 사용", "퇴비화 가능", "기타"],
  axis: "lab",
};
const F_COLOR: SpecField = {
  key: "color",
  label: "색상",
  type: "select",
  options: ["투명", "반투명", "착색", "카본블랙"],
  axis: "recy",
  hint: "카본블랙은 NIR 선별이 불가해 재활용을 저해",
};

/* ────────────────────────── 유형 정의 (16종) ────────────────────────── */

export const COMPONENT_TYPE_SPECS: ComponentTypeSpec[] = [
  {
    key: "병 / 용기 / 자",
    category: "내용물 직접 포장",
    subTypes: ["병", "용기", "자(Jar)", "캐니스터", "앰플·바이알"],
    materialGroups: ["플라스틱", "유리", "금속", "바이오·생분해 플라스틱", "복합재"],
    fields: [
      { key: "wall", label: "벽 구조", type: "select", options: ["단층", "이중벽", "다층 공압출"], axis: "recy" },
      { key: "molding", label: "성형 방식", type: "select", options: ["사출 연신 블로우 성형", "압출 블로우 성형", "사출 성형", "열성형", "유리 성형"], axis: "recy" },
      { key: "inner_container", label: "내부용기 여부", type: "select", options: ["예", "아니오"], axis: "recy" },
      { key: "barrier", label: "차광·차단 기능", type: "select", options: ["없음", "차광", "산소 차단", "수분 차단", "복합 차단"], axis: "recy" },
      { key: "emptiable", label: "비움 가능성", type: "select", options: ["완전히 비울 수 있음", "일부 잔류", "비우기 어려움"], axis: "min" },
      { key: "heat_pressure", label: "내열·내압 여부", type: "select", options: ["해당 없음", "내열", "내압", "내열·내압"], axis: "reu" },
      { key: "refillable", label: "리필 구조 여부", type: "select", options: ["예", "아니오"], axis: "reu" },
      { key: "functions", label: "포장 기능", type: "multiselect", options: ["내용물 보관", "보호", "운송", "정량 토출", "재밀봉", "표시"], axis: "min" },
      F_FOOD_CONTACT,
      F_ECO_CLAIM,
    ],
    docs: [...BASE_DOCS, DOC_PFAS, DOC_FUNCTION, DOC_PCR],
  },
  {
    key: "튜브",
    category: "내용물 직접 포장",
    subTypes: ["압출 튜브", "라미네이트 튜브", "알루미늄 튜브", "에어리스 튜브"],
    materialGroups: ["플라스틱", "복합재", "금속", "바이오·생분해 플라스틱"],
    fields: [
      { key: "sleeve_structure", label: "슬리브 구조", type: "select", options: ["mono-PE", "mono-PP", "다층 라미네이트", "알루미늄 배리어"], axis: "recy" },
      { key: "shoulder_material", label: "숄더·헤드 소재", type: "select", options: ["본체와 동일계열", "타 소재"], axis: "recy" },
      { key: "barrier_layer", label: "배리어층", type: "select", options: ["없음", "EVOH", "알루미늄", "메탈라이즈드"], axis: "recy", hint: "알루미늄 층이 있으면 대부분 재활용 불가" },
      { key: "emptiable", label: "비움 가능성", type: "select", options: ["완전히 비울 수 있음", "일부 잔류", "비우기 어려움"], axis: "min" },
      F_FOOD_CONTACT,
      F_ECO_CLAIM,
    ],
    docs: [...BASE_DOCS, DOC_PFAS, DOC_RECYCLABILITY, DOC_PCR],
  },
  {
    key: "파우치 / 사세",
    category: "내용물 직접 포장",
    subTypes: ["스탠드업 파우치", "플랫 파우치", "사세(스틱)", "스파우트 파우치", "레토르트 파우치"],
    materialGroups: ["플라스틱", "복합재", "바이오·생분해 플라스틱", "종이·판지"],
    fields: [
      { key: "structure", label: "필름 구조", type: "select", options: ["mono-PE", "mono-PP", "다층 라미네이트", "종이 복합"], axis: "recy" },
      { key: "alu", label: "알루미늄·메탈라이즈드 층", type: "select", options: ["없음", "알루미늄 박", "메탈라이즈드"], axis: "recy", hint: "있으면 대부분 재활용 불가" },
      { key: "layers", label: "레이어 구성", type: "text", axis: "recy", hint: "예: PET12 / AL7 / PE80" },
      { key: "fitment", label: "부속", type: "multiselect", options: ["없음", "지퍼", "스파우트", "노치", "밸브"], axis: "recy" },
      { key: "emptiable", label: "비움 가능성", type: "select", options: ["완전히 비울 수 있음", "일부 잔류", "비우기 어려움"], axis: "min" },
      F_FOOD_CONTACT,
      F_ECO_CLAIM,
    ],
    docs: [...BASE_DOCS, DOC_PFAS, DOC_RECYCLABILITY, DOC_FUNCTION, DOC_PCR],
  },
  {
    key: "필름 / 랩",
    category: "내용물 직접 포장",
    subTypes: ["수축 필름", "스트레치 랩", "오버랩 필름", "밀봉 필름"],
    materialGroups: ["플라스틱", "바이오·생분해 플라스틱", "복합재"],
    fields: [
      { key: "structure", label: "필름 구조", type: "select", options: ["mono-PE", "mono-PP", "PVC", "다층 라미네이트"], axis: "recy" },
      { key: "thickness", label: "두께", type: "number", unit: "μm", axis: "min" },
      { key: "printed_area", label: "인쇄 면적 비율", type: "number", unit: "%", axis: "recy", hint: "인쇄 면적이 크면 재활용 품질 저하" },
      F_COLOR,
      F_FOOD_CONTACT,
      F_ECO_CLAIM,
    ],
    docs: [...BASE_DOCS, DOC_PFAS, DOC_RECYCLABILITY, DOC_PCR],
  },
  {
    key: "트레이·컵",
    category: "내용물 직접 포장",
    subTypes: ["열성형 트레이", "발포 트레이", "종이 컵", "플라스틱 컵", "펄프몰드 트레이"],
    materialGroups: ["플라스틱", "종이·판지", "바이오·생분해 플라스틱", "복합재"],
    fields: [
      { key: "forming", label: "성형 방식", type: "select", options: ["열성형", "사출 성형", "펄프 몰드", "발포"], axis: "recy" },
      { key: "coating", label: "코팅·라이너", type: "select", options: ["없음", "PE", "PLA", "왁스", "수성 배리어"], axis: "recy", hint: "코팅은 섬유 회수를 저해하고 총불소 대상이 될 수 있음" },
      { key: "absorbent_pad", label: "흡수 패드 포함", type: "select", options: ["예", "아니오"], axis: "recy" },
      F_COLOR,
      F_FOOD_CONTACT,
      F_ECO_CLAIM,
    ],
    docs: [...BASE_DOCS, DOC_PFAS, DOC_COMPOST, DOC_RECYCLABILITY, DOC_PCR],
  },
  {
    key: "블리스터",
    category: "내용물 직접 포장",
    subTypes: ["PVC 블리스터", "PET 블리스터", "알루미늄 블리스터", "클램쉘"],
    materialGroups: ["플라스틱", "복합재", "금속"],
    fields: [
      { key: "forming_film", label: "성형 필름 재질", type: "select", options: ["PVC", "PET", "PP", "PVC/PVDC"], axis: "recy" },
      { key: "lidding", label: "리딩 소재", type: "select", options: ["알루미늄 박", "종이", "필름", "없음"], axis: "recy" },
      { key: "separable_lidding", label: "리딩 분리 가능", type: "select", options: ["예", "아니오"], axis: "recy" },
      F_FOOD_CONTACT,
      F_ECO_CLAIM,
    ],
    docs: [...BASE_DOCS, DOC_PFAS, DOC_RECYCLABILITY],
  },
  {
    key: "캡·뚜껑·마개",
    category: "개봉·밀봉·토출 부품",
    subTypes: ["스크류 캡", "플립톱 캡", "디스크탑 캡", "크라운 캡", "코르크", "오버캡"],
    materialGroups: ["플라스틱", "금속", "고무·엘라스토머", "목재·천연소재", "바이오·생분해 플라스틱"],
    fields: [
      { key: "same_family", label: "본체와 동일 재질계열", type: "select", options: ["예", "아니오"], axis: "recy", hint: "동일계열이면 분리 없이 함께 재활용 가능" },
      { key: "liner", label: "라이너·가스켓", type: "select", options: ["없음", "PE 라이너", "EPE 라이너", "고무 가스켓", "기타"], axis: "recy" },
      { key: "tethered", label: "부착형(tethered)", type: "select", options: ["예", "아니오"], axis: "recy", hint: "SUP 지침상 음료용기 3L 이하는 부착형 의무" },
      { key: "tamper", label: "위조방지 링", type: "select", options: ["있음", "없음"], axis: "recy" },
      F_FOOD_CONTACT,
      F_ECO_CLAIM,
    ],
    docs: [...BASE_DOCS, DOC_PFAS, DOC_PCR],
  },
  {
    key: "펌프·스프레이·밸브",
    category: "개봉·밀봉·토출 부품",
    subTypes: ["로션 펌프", "미스트 스프레이", "에어리스 펌프", "에어로졸 밸브", "드로퍼"],
    materialGroups: ["플라스틱", "금속", "고무·엘라스토머", "복합재"],
    fields: [
      { key: "spring", label: "금속 스프링 포함", type: "select", options: ["예", "아니오"], axis: "recy", hint: "금속 스프링은 선별·재활용을 저해" },
      { key: "parts_count", label: "구성 부품 수", type: "number", unit: "개", axis: "recy" },
      { key: "mono_material", label: "단일 재질 설계", type: "select", options: ["예", "아니오"], axis: "recy" },
      { key: "separable_by_user", label: "소비자 분리 가능", type: "select", options: ["예", "아니오"], axis: "recy" },
      F_FOOD_CONTACT,
      F_ECO_CLAIM,
    ],
    docs: [...BASE_DOCS, DOC_RECYCLABILITY, DOC_PCR],
  },
  {
    key: "실링재·라이너·패킹",
    category: "개봉·밀봉·토출 부품",
    subTypes: ["유도 실링", "압착 라이너", "가스켓", "밀봉 필름"],
    materialGroups: ["플라스틱", "복합재", "고무·엘라스토머", "금속"],
    fields: [
      { key: "seal_type", label: "실링 방식", type: "select", options: ["유도 실링", "열 실링", "압착", "접착"], axis: "recy" },
      { key: "alu_layer", label: "알루미늄 층", type: "select", options: ["있음", "없음"], axis: "recy" },
      { key: "removable", label: "제거 용이성", type: "select", options: ["쉽게 제거 가능", "제거 어려움"], axis: "recy" },
      F_FOOD_CONTACT,
      F_ECO_CLAIM,
    ],
    docs: [...BASE_DOCS, DOC_PFAS],
  },
  {
    key: "라벨·슬리브",
    category: "표시·보호·고정 부품",
    subTypes: ["점착 라벨", "인몰드 라벨", "수축 슬리브", "롤 라벨", "택·행택"],
    materialGroups: ["플라스틱", "종이·판지", "복합재", "바이오·생분해 플라스틱"],
    fields: [
      { key: "label_material", label: "라벨 소재", type: "select", options: ["종이", "PP 필름", "PET 필름", "PE 필름", "PS 슬리브"], axis: "recy" },
      { key: "adhesive", label: "접착제", type: "select", options: ["영구 접착", "수세 분리(washable)", "재박리(removable)", "없음"], axis: "recy" },
      { key: "metallized", label: "금속화(metallized)", type: "select", options: ["예", "아니오"], axis: "recy" },
      { key: "area_ratio", label: "본체 대비 면적", type: "number", unit: "%", axis: "recy", hint: "full-body sleeve 는 본체 선별을 방해" },
      { key: "float", label: "부상 분리 가능(밀도<1)", type: "select", options: ["예", "아니오", "모름"], axis: "recy" },
      { key: "marking", label: "표기 항목", type: "multiselect", options: ["재질 표시", "분리배출 표시", "EPR 마크", "QR·바코드", "없음"], axis: "lab" },
      F_ECO_CLAIM,
    ],
    docs: [...BASE_DOCS, DOC_RECYCLABILITY, DOC_PCR],
  },
  {
    key: "인서트·완충재",
    category: "표시·보호·고정 부품",
    subTypes: ["펄프몰드", "EPS 완충재", "에어캡", "종이 완충재", "폼 인서트"],
    materialGroups: ["종이·판지", "플라스틱", "바이오·생분해 플라스틱", "목재·천연소재"],
    fields: [
      { key: "cushion_material", label: "완충 소재", type: "select", options: ["펄프몰드", "EPS", "EPE", "에어캡", "종이", "전분계"], axis: "min", hint: "빈 공간 비율 계산 시 완충재는 빈 공간으로 간주" },
      { key: "void_ratio", label: "차지하는 빈 공간 비율", type: "number", unit: "%", axis: "min" },
      { key: "recyclable_stream", label: "기존 회수 체계 배출 가능", type: "select", options: ["예", "아니오", "모름"], axis: "recy" },
      F_ECO_CLAIM,
    ],
    docs: [...BASE_DOCS, DOC_RECYCLABILITY, DOC_FUNCTION],
  },
  {
    key: "테이프·밴드·스트랩",
    category: "표시·보호·고정 부품",
    subTypes: ["OPP 테이프", "종이 테이프", "PET 밴드", "PP 밴드", "고무 밴드"],
    materialGroups: ["플라스틱", "종이·판지", "고무·엘라스토머"],
    fields: [
      { key: "carrier", label: "기재 소재", type: "select", options: ["OPP", "PVC", "종이", "PET", "PP"], axis: "recy" },
      { key: "adhesive", label: "접착제", type: "select", options: ["아크릴", "핫멜트", "고무계", "수용성", "없음"], axis: "recy" },
      { key: "separable_from_box", label: "박스에서 분리 가능", type: "select", options: ["예", "아니오"], axis: "recy" },
      F_ECO_CLAIM,
    ],
    docs: [...BASE_DOCS],
  },
  {
    key: "잉크·코팅·접착제",
    category: "표시·보호·고정 부품",
    subTypes: ["인쇄 잉크", "바니시·코팅", "접착제", "프라이머"],
    materialGroups: ["플라스틱", "복합재", "기타" as string],
    fields: [
      { key: "ink_type", label: "잉크·코팅 종류", type: "select", options: ["수성", "UV 경화", "용제형", "광유(mineral oil)", "기타"], axis: "soc" },
      { key: "coverage", label: "도포 면적 비율", type: "number", unit: "%", axis: "recy" },
      { key: "deinkable", label: "탈묵·제거 가능", type: "select", options: ["예", "아니오", "모름"], axis: "recy" },
      { key: "svhc", label: "SVHC 함유 여부", type: "select", options: ["없음", "있음", "모름"], axis: "soc" },
      F_FOOD_CONTACT,
    ],
    docs: [DOC_TDS, DOC_HEAVY_METAL, DOC_PFAS],
  },
  {
    key: "단상자·케이스",
    category: "외부·운송 포장",
    subTypes: ["접이식 단상자", "슬리브 케이스", "세트 케이스", "기프트 박스"],
    materialGroups: ["종이·판지", "복합재", "플라스틱"],
    fields: [
      { key: "grammage", label: "평량", type: "number", unit: "g/m²", axis: "min" },
      { key: "coating", label: "표면 가공", type: "select", options: ["없음", "UV 코팅", "라미네이팅", "포일 스탬핑", "엠보싱"], axis: "recy" },
      { key: "window", label: "플라스틱 윈도우", type: "select", options: ["있음", "없음"], axis: "recy" },
      { key: "void_ratio", label: "빈 공간 비율", type: "number", unit: "%", axis: "min", hint: "Article 10 과대포장 판정에 사용" },
      { key: "ink", label: "인쇄 방식", type: "select", options: ["수성", "UV", "용제형", "미인쇄"], axis: "soc" },
      F_ECO_CLAIM,
    ],
    docs: [...BASE_DOCS, DOC_FUNCTION, DOC_RECYCLABILITY, DOC_PCR],
  },
  {
    key: "외박스·배송박스",
    category: "외부·운송 포장",
    subTypes: ["골판지 박스", "이커머스 배송박스", "완충 봉투", "택배 봉투"],
    materialGroups: ["종이·판지", "플라스틱", "복합재"],
    fields: [
      { key: "corrugation", label: "골 구조", type: "select", options: ["해당 없음", "단면", "양면", "이중양면", "삼중"], axis: "min" },
      { key: "grammage", label: "평량", type: "number", unit: "g/m²", axis: "min" },
      { key: "wet_strength", label: "습윤강도지 사용", type: "select", options: ["예", "아니오"], axis: "recy" },
      { key: "void_ratio", label: "빈 공간 비율", type: "number", unit: "%", axis: "min", hint: "이커머스 포장은 Article 10 빈 공간 50% 상한 대상" },
      { key: "reusable", label: "재사용 설계", type: "select", options: ["예", "아니오"], axis: "reu" },
      F_ECO_CLAIM,
    ],
    docs: [...BASE_DOCS, DOC_FUNCTION, DOC_RECYCLABILITY, DOC_PCR],
  },
  {
    key: "팔레트·크레이트",
    category: "외부·운송 포장",
    subTypes: ["목재 팔레트", "플라스틱 팔레트", "종이 팔레트", "크레이트", "IBC"],
    materialGroups: ["목재·천연소재", "플라스틱", "종이·판지", "금속"],
    fields: [
      { key: "reuse_cycles", label: "예상 재사용 횟수", type: "number", unit: "회", axis: "reu" },
      { key: "pooling", label: "풀링 시스템 사용", type: "select", options: ["예", "아니오"], axis: "reu", hint: "Article 11 재사용 포장 목표 산정 근거" },
      { key: "repairable", label: "수리 가능", type: "select", options: ["예", "아니오"], axis: "reu" },
      { key: "ispm15", label: "ISPM 15 처리(목재)", type: "select", options: ["해당 없음", "완료", "미완료"], axis: "soc" },
      F_ECO_CLAIM,
    ],
    docs: [DOC_DRAWING, DOC_TDS, DOC_FUNCTION],
  },
];

export const TYPE_KEYS = COMPONENT_TYPE_SPECS.map((s) => s.key);

export function specForType(type: string | null | undefined): ComponentTypeSpec | undefined {
  if (!type) return undefined;
  return COMPONENT_TYPE_SPECS.find((s) => s.key === type);
}

export function typesByCategory(category: TypeCategory | "전체"): ComponentTypeSpec[] {
  if (category === "전체") return COMPONENT_TYPE_SPECS;
  return COMPONENT_TYPE_SPECS.filter((s) => s.category === category);
}
