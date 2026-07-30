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

// ─────────────────────────────────────────────────────────────
// 사업자 정보 (전자상거래법 표시사항)
// ⚠️ TODO: PG 심사 전에 반드시 "실제" 사업자 정보로 교체하세요.
//    상호/대표자/사업자등록번호/통신판매업신고번호/주소/고객센터.
// ─────────────────────────────────────────────────────────────
export const MERCHANT = {
  serviceName: "PPWR AI",
  companyName: "리베이션 주식회사", // 상호
  ceo: "홍길동", // 대표자
  bizRegNo: "000-00-00000", // 사업자등록번호
  mailOrderNo: "제0000-서울강남-00000호", // 통신판매업신고번호
  address: "서울특별시 강남구 테헤란로 000, 00층", // 사업장 주소
  tel: "02-0000-0000", // 고객센터
  email: "support@ppwr.ai", // 문의 이메일
  hostingProvider: "Vercel Inc.", // 호스팅 제공자
  privacyOfficer: "홍길동", // 개인정보 보호책임자
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
  price: number; // KRW
  unit: string; // "1회" | "월"
  billingCycle?: "monthly"; // 구독 주기
  features: string[];
  badge?: string;
  highlight?: boolean;
};

export const PRODUCTS: Product[] = [
  {
    id: "diy-diagnosis",
    type: "onetime",
    name: "PPWR 셀프진단권 (DIY)",
    tagline: "제품 1건에 대한 EU PPWR 적합성 셀프진단 1회 이용권",
    price: 49000,
    unit: "1회",
    features: [
      "제품·포장 구조 입력 진단 1건",
      "미이행 리스크 리포트 즉시 발급",
      "공급사 제출용 RFI 자동 매핑",
      "발급일로부터 30일 열람",
    ],
    badge: "단건 결제",
  },
  {
    id: "managed-basic",
    type: "subscription",
    name: "매니지드 베이직 (월 구독)",
    tagline: "매월 진단 크레딧과 전문가 검수를 제공하는 정기 구독",
    price: 99000,
    unit: "월",
    billingCycle: "monthly",
    features: [
      "매월 진단 크레딧 10건",
      "규정 업데이트 자동 반영",
      "리포트 히스토리 무제한 보관",
      "이메일 기술 지원",
    ],
    badge: "정기 결제",
    highlight: true,
  },
  {
    id: "managed-pro",
    type: "subscription",
    name: "매니지드 프로 (월 구독)",
    tagline: "대량 제품군을 위한 무제한 진단 + 전담 컨설팅 구독",
    price: 299000,
    unit: "월",
    billingCycle: "monthly",
    features: [
      "무제한 진단 크레딧",
      "전담 매니저 배정",
      "공급사 자료 수집 대행",
      "우선 기술 지원(SLA)",
    ],
    badge: "정기 결제",
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function formatKRW(n: number): string {
  return n.toLocaleString("ko-KR") + "원";
}
