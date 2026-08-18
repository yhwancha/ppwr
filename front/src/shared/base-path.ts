/**
 * 앱 basePath ('/ppwr'). next.config 의 basePath 와 동일 값(NEXT_PUBLIC_BASE_PATH).
 *
 * <Link>·router.push·redirect 등 Next 내부 네비게이션은 basePath 가 자동 적용되지만,
 * 브라우저가 만드는 "절대 URL"은 자동적용이 안 된다. 아래 경우에 이 상수를 프리픽스로 붙인다:
 *   - OAuth 콜백 redirectTo
 *   - 포트원 결제 redirectUrl
 *   - 클라이언트에서 내부 API Route 로의 fetch('/api/...')
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
