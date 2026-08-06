/**
 * 부품 유형별 PPWR 상세 필드 정의 (config-driven 조건부 폼).
 *
 * 여기 필드는 "유형에만 필요한 상세 속성"으로, 공통 컬럼(name/type/recycled_content/
 * pfas·heavy_metal·compostability_status)에 없는 것들이다.
 *
 * ⚠️ 저장 위치(현재): ppwr.ComponentMaster 에 전용 attributes(JSONB) 컬럼이 아직 없어,
 *    이 값들을 material_summary(TEXT)에 JSON 으로 직렬화해 보관한다(재활용).
 *    → 추후 attributes JSONB 컬럼 추가 시 material_summary → attributes 로 이관.
 *
 * 각 필드의 axis 는 어느 PPWR 판정 축에 쓰이는지(진단 엔진 참고용):
 *   recy=재활용성 · pcr=재생원료 · soc=유해물질 · reu=재사용 · min=최소화
 */

export type SpecAxis = "recy" | "pcr" | "soc" | "reu" | "min";
export type SpecField = {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "bool";
  options?: string[];
  unit?: string;
  hint?: string;
  axis?: SpecAxis;
};
export type ComponentTypeSpec = {
  key: string; // ppwr.ComponentMaster.type 에 저장되는 값 (한글 라벨)
  emoji: string;
  fields: SpecField[];
};

export const AXIS_LABEL: Record<SpecAxis, string> = {
  recy: "재활용",
  pcr: "재생원료",
  soc: "유해물질",
  reu: "재사용",
  min: "최소화",
};

/** type(라벨) → 상세 스펙. 폼의 "유형" 셀렉트 옵션도 이 순서/키를 따른다. */
export const COMPONENT_TYPE_SPECS: ComponentTypeSpec[] = [
  {
    key: "플라스틱 용기/병",
    emoji: "🟦",
    fields: [
      { key: "polymer", label: "폴리머 종류", type: "select", options: ["PET", "HDPE", "PP", "LDPE", "PS", "PVC", "기타"], axis: "recy" },
      { key: "mono", label: "단일 소재 여부", type: "bool", axis: "recy" },
      { key: "barrier", label: "배리어층", type: "select", options: ["없음", "EVOH", "나일론", "기타"], axis: "recy" },
      { key: "color", label: "색상", type: "select", options: ["투명", "착색", "카본블랙"], axis: "recy", hint: "카본블랙은 NIR 선별 불가 → 재활용 저해" },
      { key: "density", label: "밀도(물 기준)", type: "select", options: ["뜸(float)", "가라앉음(sink)"], axis: "recy" },
      { key: "label_type", label: "라벨 방식", type: "select", options: ["종이 라벨", "PP/PET 필름", "full-body sleeve", "없음"], axis: "recy", hint: "full-body sleeve는 선별 저해" },
      { key: "cap", label: "뚜껑 소재", type: "select", options: ["본체와 동일계열", "타 소재", "없음"], axis: "recy" },
      { key: "tethered", label: "뚜껑 부착형(tethered)", type: "bool", axis: "recy" },
      { key: "food", label: "식품 접촉 여부", type: "bool", axis: "pcr", hint: "재생원료 목표치·PFAS 규제 갈림" },
    ],
  },
  {
    key: "종이/판지",
    emoji: "🟫",
    fields: [
      { key: "grammage", label: "평량", type: "number", unit: "g/m²", axis: "recy" },
      { key: "corrugation", label: "골판지 종류", type: "select", options: ["해당없음", "단면", "양면", "이중양면"], axis: "recy" },
      { key: "coating", label: "코팅", type: "select", options: ["없음", "PE", "PLA", "왁스", "기타"], axis: "recy", hint: "코팅은 섬유회수 저해 + 총불소 대상" },
      { key: "wet", label: "습윤강도지", type: "bool", axis: "recy" },
      { key: "ink", label: "잉크/인쇄", type: "select", options: ["수성", "UV", "광유(mineral oil)", "기타"], axis: "recy" },
      { key: "window", label: "플라스틱 윈도우/라미네이션", type: "bool", axis: "recy" },
    ],
  },
  {
    key: "유리 병/용기",
    emoji: "🟩",
    fields: [
      { key: "color", label: "색상", type: "select", options: ["투명", "갈색", "녹색", "기타"], axis: "recy", hint: "컬릿 스트림 분리에 영향" },
      { key: "surface", label: "표면 처리", type: "select", options: ["없음", "세라믹/유약 인쇄", "코팅"], axis: "recy" },
      { key: "adhesive", label: "라벨 접착제", type: "select", options: ["수용성(분리 쉬움)", "영구 접착"], axis: "recy" },
      { key: "closure", label: "뚜껑", type: "select", options: ["금속(분리)", "플라스틱(분리)", "코르크"], axis: "recy" },
      { key: "refill", label: "리필/재사용 가능", type: "bool", axis: "reu" },
    ],
  },
  {
    key: "캡/뚜껑",
    emoji: "🟪",
    fields: [
      { key: "material", label: "소재", type: "select", options: ["PP", "PE", "금속", "기타"], axis: "recy" },
      { key: "same", label: "본체와 동일 재질계열", type: "bool", axis: "recy", hint: "동일계열이면 분리 불필요" },
      { key: "liner", label: "라이너", type: "select", options: ["없음", "PE 라이너", "기타"], axis: "recy" },
      { key: "tethered", label: "부착형(tethered)", type: "bool", axis: "recy" },
    ],
  },
  {
    key: "라벨",
    emoji: "🏷️",
    fields: [
      { key: "material", label: "소재", type: "select", options: ["종이", "PP 필름", "PET 필름", "기타"], axis: "recy" },
      { key: "adhesive", label: "접착제", type: "select", options: ["영구", "washable(수세 분리)", "removable"], axis: "recy" },
      { key: "metallized", label: "금속화(metallized)", type: "bool", axis: "recy" },
      { key: "area", label: "본체 대비 면적", type: "number", unit: "%", axis: "recy", hint: "면적이 크면 본체 재활용 방해" },
    ],
  },
  {
    key: "파우치/필름",
    emoji: "🟨",
    fields: [
      { key: "structure", label: "구조", type: "select", options: ["mono-PE", "mono-PP", "다층 라미네이트"], axis: "recy" },
      { key: "alu", label: "알루미늄/금속화 층", type: "bool", axis: "recy", hint: "있으면 대부분 재활용 불가" },
      { key: "layers", label: "레이어 구성", type: "text", axis: "recy" },
      { key: "spout", label: "부속", type: "select", options: ["없음", "지퍼", "스파우트"], axis: "recy" },
      { key: "food", label: "식품 접촉 여부", type: "bool", axis: "pcr" },
    ],
  },
  {
    key: "금속(캔/튜브)",
    emoji: "🥫",
    fields: [
      { key: "material", label: "재질", type: "select", options: ["알루미늄", "철", "주석도금"], axis: "recy" },
      { key: "inner_coating", label: "내부 코팅/라이너", type: "select", options: ["없음", "에폭시", "BPA-NI", "기타"], axis: "soc" },
    ],
  },
  {
    key: "완충재/필러",
    emoji: "🧊",
    fields: [
      { key: "material", label: "소재", type: "select", options: ["EPS", "PE 폼", "종이", "전분", "기타"], axis: "min", hint: "빈공간비율 계산 시 filler는 빈공간으로 간주" },
      { key: "recyclable", label: "재활용 가능", type: "bool", axis: "recy" },
    ],
  },
  { key: "기타", emoji: "📦", fields: [] },
];

export const TYPE_KEYS = COMPONENT_TYPE_SPECS.map((s) => s.key);
export function specForType(type: string | null | undefined): ComponentTypeSpec | undefined {
  return COMPONENT_TYPE_SPECS.find((s) => s.key === type);
}
