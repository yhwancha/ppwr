/**
 * 로그인 후 복귀 경로(`?redirect=`) 정규화.
 *
 * 값은 URL 쿼리에서 오므로 신뢰할 수 없다. 앱 내부 경로만 허용해
 * `?redirect=https://evil.example` 같은 오픈 리다이렉트를 차단한다.
 *
 * 허용: "/app/billing/checkout?product=review-test-100" 처럼 '/' 로 시작하는 경로+쿼리
 * 차단: 절대 URL("https://…"), 프로토콜 상대 URL("//evil.example"), 백슬래시 변형
 */
export function safeRedirect(value: string | null | undefined, fallback: string): string {
  if (!value) return fallback;
  // 백슬래시는 일부 브라우저가 '/' 로 정규화하므로 "//" 우회에 쓰인다.
  const normalized = value.replace(/\\/g, "/");
  if (!normalized.startsWith("/") || normalized.startsWith("//")) return fallback;
  return normalized;
}
