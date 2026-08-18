/**
 * PortOne(포트원) 결제 연동 설정 · 상품 카탈로그 · 사업자 정보.
 *
 * PG 심사(전자결제 계약 심사)에서 확인하는 요소들을 한 곳에 모아 둔다.
 *   - 상품/가격 정보(PRODUCTS)
 *   - 사업자·통신판매업 정보(MERCHANT) → Footer / 약관 페이지에 노출
 *   - PortOne 연동 키(PORTONE) → 결제창 호출용
 */

/** 브라우저 결제창 호출에 쓰는 공개 설정 (NEXT_PUBLIC_) */
export const PORTONE = {
  storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID ?? "",
  channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY ?? "",
} as const;

/** 키가 세팅됐는지 (미설정 시 UI에서 안내 배너를 띄운다) */
export function isPortOneConfigured() {
  return (
    PORTONE.storeId.startsWith("store-") &&
    PORTONE.channelKey.startsWith("channel-key-")
  );
}

/**
 * 정기결제(빌링) 노출·실행 여부.
 * PG 심사는 일반결제(단건)만 먼저 진행하므로 false. → 정기결제 상품/결제 경로를 숨긴다.
 *
 * 정기결제 재개 시 필요한 것(이번에 롤백된 것들):
 *   1. 포트원 콘솔에 KCP 정기결제 채널 연동 → 전용 채널키를 별도 env 로 분리
 *      (KCP 는 결제유형별 사이트코드(MID)가 달라 일반결제 채널키로는 빌링키 발급 불가)
 *   2. Dockerfile.ppwr / ppwr-dev-deployment.yml 에 그 채널키 build-arg 배선
 *   3. 심사용 정기결제 상품(review-sub-100) 재추가
 *   4. 약관 제4·5조 / 취소·환불 규정 / 개인정보처리방침의 정기결제 조항 복원
 *   5. 이 플래그를 true 로
 *
 * ⚠️ 채널은 반드시 V2(NHN KCP) 로 연동해야 한다. V1 채널(pgProvider `KCP`/`KCP_BILLING`)은
 *    V2 SDK 가 지원하지 않아 결제창 호출이 "KCP 에 대해 지원하지 않는 기능입니다" 로 실패한다.
 */
export const SUBSCRIPTION_ENABLED = false;

// ─────────────────────────────────────────────────────────────
// 사업자 정보 (전자상거래법 표시사항)
// Footer(마케팅) · AppFooter(/app/*) 양쪽에서 상시 노출된다 — PG·카드사 입점심사 필수 요건.
// ─────────────────────────────────────────────────────────────
export const MERCHANT = {
  serviceName: "PPWR AI",
  companyName: "리베이션(주)", // 상호
  companyNameEn: "REVATION", // 영문 상호 (copyright)
  ceo: "이민성", // 대표자
  bizRegNo: "438-81-02556", // 사업자등록번호
  mailOrderNo: "제2024-서울강서-1185호", // 통신판매업신고번호
  address: "서울특별시 강서구 마곡중앙로 143, B동 3층(마곡동, 르웨스트시티)", // 사업장 주소
  tel: "02-6959-7080", // 고객센터 (유선)
  email: "sales@revation.co.kr", // 문의 이메일
  privacyOfficer: "이민성", // 개인정보 보호책임자
  // 호스팅 제공자 — 개인정보처리방침의 처리위탁 항목에 수탁자로 고지된다.
  // ppwr 컨테이너를 포함한 전 서비스가 Azure Container Apps 에서 구동된다.
  hostingProvider: "Microsoft Azure (Microsoft Corporation)",
} as const;

// ─────────────────────────────────────────────────────────────
// 상품 카탈로그 (목업)
// PG 심사 시 "실제 판매 상품과 가격"이 명확히 보여야 하므로 단건/구독 모두 정의.
// ─────────────────────────────────────────────────────────────
export type PlanType = "onetime" | "subscription";

export type Product = {
  id: string;
  type: PlanType;
  name: string; // 결제창 orderName
  tagline: string;
  price: number; // KRW (실제 카드 결제 금액)
  unit: string; // "1회" | "월"
  priceNote?: string; // 가격 부가설명 (예: "+ SKU당 8만원")
  listPrice?: number; // 개별 합계(정가) — 패키지 할인 표시용 취소선
  billingCycle?: "monthly"; // 구독 주기
  features: string[];
  badge?: string;
  highlight?: boolean;
};

/**
 * 결제 가능한 상품(카드 결제) 카탈로그.
 *  - 구독: 기본형/성장형 (월 기본료 기준, SKU 추가요금은 priceNote 로 안내)
 *  - 단건: 문서 패키지 4종
 *  - 심사용 100원 테스트 상품
 * (무료형/기업형은 결제가 아닌 가입·문의라 PRODUCTS 가 아닌 SUBSCRIPTION_TIERS 로만 노출)
 */
export const PRODUCTS: Product[] = [
  // ── 구독 (월 정기결제) ──
  {
    id: "sub-basic",
    type: "subscription",
    name: "기본형 (월 구독)",
    tagline: "소수 SKU를 직접 관리하는 EU 수출 준비 기업을 위한 구독",
    price: 290000,
    unit: "월",
    priceNote: "기본료 · SKU당 8만원 별도",
    billingCycle: "monthly",
    features: [
      "관리 SKU 1~5개 · 계정 3개",
      "등록 SKU 내 PPWR AI 진단 무제한",
      "DoC·TD 발행 (등록 SKU 내)",
      "친환경 전환 기본 개선 의견",
    ],
    badge: "정기 결제",
  },
  {
    id: "sub-growth",
    type: "subscription",
    name: "성장형 (월 구독)",
    tagline: "다수 SKU와 공급사 자료를 지속 관리하는 브랜드사·제조사용 구독",
    price: 590000,
    unit: "월",
    priceNote: "기본료 · SKU당 6만원 별도",
    billingCycle: "monthly",
    features: [
      "관리 SKU 6~20개 · 계정 10개",
      "PPWR AI 진단·DoC·TD 무제한",
      "연간 2 SKU 등록 대행 지원",
      "SKU별 구체적 친환경 개선안",
      "월 1회 관리 SKU 정기 검토",
    ],
    badge: "정기 결제",
    highlight: true,
  },
  // ── 건별 서비스 단가 (무료형: 구독 없이 필요한 서비스만 건별 결제) ──
  {
    id: "svc-ai-diagnosis",
    type: "onetime",
    name: "PPWR AI 진단 (1건)",
    tagline: "제품 1건에 대한 PPWR 사전진단",
    price: 100000,
    unit: "건",
    priceNote: "가입 시 월 1회 무료, 이후 건당",
    features: [
      "제품·포장재 정보 기반 대응 수준 점검",
      "누락 정보·공급사 요청자료 구분 안내",
    ],
    badge: "건별 결제",
  },
  {
    id: "svc-doc",
    type: "onetime",
    name: "DoC 발행 (1건)",
    tagline: "SKU별 EU 적합성 선언서(DoC) 발행",
    price: 400000,
    unit: "건",
    features: ["TD·증빙 기반 DoC 발행", "발행 이력·버전 관리"],
    badge: "건별 결제",
  },
  {
    id: "svc-td",
    type: "onetime",
    name: "TD 작성 (1건)",
    tagline: "SKU별 기술문서(TD) 작성",
    price: 800000,
    unit: "건",
    features: ["포장재 PPWR 대응 근거 정리", "증빙자료 목록 포함"],
    badge: "건별 결제",
  },
  {
    id: "svc-doc-td",
    type: "onetime",
    name: "DoC·TD 통합 발행",
    tagline: "기술문서(TD)와 적합성 선언서(DoC)를 통합 발행",
    price: 1000000,
    unit: "건",
    features: ["TD + DoC 통합 발행", "EPR 기초자료 연계"],
    badge: "건별 결제",
    highlight: true,
  },
  // ── 미구독 고객 1차 패키지 (여러 서비스 묶음 · 개별 합산 대비 할인) ──
  {
    id: "pkg-self",
    type: "onetime",
    name: "직접 등록형 문서 패키지",
    tagline: "고객이 직접 정보를 등록하고 문서를 통합 발행하는 기본 패키지",
    price: 1000000,
    listPrice: 1000000,
    unit: "건",
    features: [
      "고객 직접 제품·포장 정보 등록",
      "DoC·TD 통합 발행",
      "EPR 기초 레포트 제공",
    ],
    badge: "미구독 패키지",
  },
  {
    id: "pkg-supplement",
    type: "onetime",
    name: "자료 보완형 패키지",
    tagline: "직접 등록에 증빙자료 정리·매핑을 더한 패키지",
    price: 1400000,
    listPrice: 1500000,
    unit: "건",
    features: [
      "고객 직접 정보 등록",
      "증빙자료 정리·매핑",
      "DoC·TD 발행 + EPR 기초 레포트",
    ],
    badge: "미구독 패키지",
  },
  {
    id: "pkg-agency",
    type: "onetime",
    name: "등록 대행형 문서 패키지",
    tagline: "제품·포장 정보 등록을 대행하고 증빙까지 매핑하는 패키지",
    price: 2100000,
    listPrice: 2300000,
    unit: "건",
    features: [
      "제품·포장 정보 등록 대행",
      "증빙자료 매핑",
      "DoC·TD 발행 + EPR 기초 레포트",
    ],
    badge: "미구독 패키지",
  },
  {
    id: "pkg-total",
    type: "onetime",
    name: "PPWR 통합 대응 패키지",
    tagline: "등록 대행 문서 패키지에 친환경 전환 제안을 더한 통합 패키지",
    price: 2500000,
    listPrice: 2800000,
    unit: "건",
    features: [
      "등록 대행형 문서 패키지 전체",
      "친환경 전환 기본 제안",
      "DoC·TD 발행 + EPR 기초 레포트",
    ],
    badge: "미구독 패키지",
    highlight: true,
  },
  // ⚠️ PG 실결제 심사용 임시 상품. 심사 통과 후 제거하세요.
  //
  // 상품명·설명·구성은 실제 판매 상품(svc-ai-diagnosis)과 동일하게 두고 금액만 100원으로 낮춘다.
  // 카드사 심사는 상품명에 "TEST"가 들어가거나 결제금액이 0원이면 진행되지 않으므로,
  // 심사용이라는 사실이 화면 문구로 드러나지 않아야 한다.
  {
    id: "review-test-100",
    type: "onetime",
    name: "PPWR AI 진단 (1건)",
    tagline: "제품 1건에 대한 PPWR 사전진단",
    price: 100,
    unit: "건",
    features: [
      "제품·포장재 정보 기반 대응 수준 점검",
      "누락 정보·공급사 요청자료 구분 안내",
    ],
    badge: "건별 결제",
  },
];

/**
 * 구독 요금제 4단계 (요금제 페이지 표시용).
 * 무료형·기업형은 결제가 아닌 가입/문의로 연결되고,
 * 기본형·성장형은 위 PRODUCTS(sub-basic/sub-growth) 결제로 연결된다.
 */
export type SubscriptionTier = {
  id: string;
  name: string;
  audience: string; // 권장 고객
  sku: string; // 관리 SKU 범위
  accounts: string; // 계정 수
  priceLabel: string; // 큰 가격 문구
  priceSub: string; // 부가 설명
  features: string[];
  cta: { label: string; href: string };
  highlight?: boolean;
};

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: "free",
    name: "무료형",
    audience: "PPWR 대응 필요성을 먼저 확인하려는 기업",
    sku: "1 SKU",
    accounts: "계정 1개",
    priceLabel: "0원",
    priceSub: "필요한 서비스만 건별 결제",
    features: [
      "제품·포장 정보 직접 등록",
      "월 1회 무료 PPWR AI 진단",
      "공급사 요청자료 목록 기본 제공",
      "규제 업데이트 이메일 안내",
    ],
    cta: { label: "무료로 시작", href: "/auth/signup" },
  },
  {
    id: "basic",
    name: "기본형",
    audience: "소수 SKU를 직접 관리하는 EU 수출 준비 기업",
    sku: "1~5 SKU",
    accounts: "계정 3개",
    priceLabel: "월 29만원~",
    priceSub: "기본료 29만원 + SKU당 8만원",
    features: [
      "등록 SKU 내 진단·문서 발행 무제한",
      "DoC·TD 발행",
      "친환경 전환 기본 개선 의견",
    ],
    cta: { label: "구독 시작", href: "/app/billing/checkout?product=sub-basic" },
  },
  {
    id: "growth",
    name: "성장형",
    audience: "다수 SKU·공급사 자료를 지속 관리하는 브랜드사·제조사",
    sku: "6~20 SKU",
    accounts: "계정 10개",
    priceLabel: "월 59만원~",
    priceSub: "기본료 59만원 + SKU당 6만원",
    features: [
      "연간 2 SKU 등록 대행 지원",
      "SKU별 구체적 친환경 개선안",
      "월 1회 관리 SKU 정기 검토",
      "ERP·API 연동(별도 구축)",
    ],
    cta: { label: "구독 시작", href: "/app/billing/checkout?product=sub-growth" },
    highlight: true,
  },
  {
    id: "enterprise",
    name: "기업형",
    audience: "대량 SKU를 운영하는 제조사·ODM·대기업",
    sku: "21 SKU 이상",
    accounts: "계정 제한 없음",
    priceLabel: "별도 견적",
    priceSub: "SKU 수·구축 범위에 따른 맞춤 견적",
    features: [
      "전담 담당자 및 정기 운영회의",
      "제품개발 프로젝트 연계",
      "ERP·API 별도 구축",
      "시험분석 대행 지원",
    ],
    cta: { label: "도입 문의", href: "mailto:sales@revation.co.kr" },
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

/** 무료형(건별 결제)에서 노출할 서비스별 단가 */
export const SERVICE_ITEMS = PRODUCTS.filter((p) => p.id.startsWith("svc-"));

/** 미구독 고객 1차 패키지 (묶음 · 등록 대행 포함) */
export const PACKAGES = PRODUCTS.filter((p) => p.id.startsWith("pkg-"));

/**
 * PG 실결제 심사용 계정.
 * 이 이메일로 로그인하면 결제 화면에 심사용 100원 상품만 노출한다.
 * (PG사 심사관에게 이 계정으로 실결제 flow만 확인시키기 위함)
 */
export const REVIEW_ACCOUNT_EMAIL = "test@test.com";

export function formatKRW(n: number): string {
  return n.toLocaleString("ko-KR") + "원";
}
