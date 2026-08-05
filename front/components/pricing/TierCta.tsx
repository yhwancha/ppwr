import Link from "next/link";

/**
 * 구독 요금제 CTA.
 *  - 문의(mailto) CTA(기업형)는 메일 링크.
 *  - 그 외(무료/구독 시작)는 대시보드 결제 화면(/app/billing)으로 이동.
 *    로그인 여부 판단은 미들웨어가 담당한다:
 *      · 로그인   → /app/billing (대시보드)
 *      · 비로그인 → 미들웨어가 /auth/login 으로 리다이렉트
 *    (클라이언트 세션 판별에 의존하지 않아, 로그인 상태에서 로그인창이 뜨던 문제 해결)
 */
export default function TierCta({
  label,
  href,
  highlight,
}: {
  label: string;
  href: string;
  highlight?: boolean;
}) {
  const isContact = href.startsWith("mailto:");
  const target = isContact ? href : "/app/billing";

  const cls =
    "mt-5 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold transition-colors " +
    (highlight
      ? "bg-primary text-white hover:bg-primary-dark"
      : "bg-primary-soft text-primary hover:bg-primary-light/50");

  if (isContact) {
    return (
      <a href={target} className={cls}>
        {label}
      </a>
    );
  }
  return (
    <Link href={target} className={cls}>
      {label}
    </Link>
  );
}
