import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { REVIEW_ACCOUNT_EMAIL } from "@/src/shared/payments/config";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * 세션을 갱신하고, 로그인이 필요한 경로(/app)를 보호한다. (RESTUDIO web과 동일 패턴)
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 로그인이 필요한 경로: /app 워크스페이스
  const isAuthRequired = request.nextUrl.pathname.startsWith("/app");

  if (isAuthRequired && !user) {
    // 복귀 경로는 쿼리까지 통째로 보존해야 한다. pathname 만 넘기면
    // /app/billing/checkout?product=… 이 상품 없이 열려 "상품을 찾을 수 없습니다" 가 뜬다.
    const target = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.search = ""; // clone() 이 물고 온 원본 쿼리가 로그인 URL 로 새지 않도록 비운다
    url.searchParams.set("redirect", target);
    const redirectResponse = NextResponse.redirect(url);
    // getUser() 가 토큰을 갱신했다면 그 쿠키를 리다이렉트 응답에도 복사해
    // 클라이언트·서버 세션이 어긋나지 않게 한다. (Supabase SSR 권장 패턴)
    supabaseResponse.cookies.getAll().forEach((c) =>
      redirectResponse.cookies.set(c.name, c.value, c),
    );
    return redirectResponse;
  }

  // PG 실결제 심사용 계정: 결제 화면(/app/billing/*)만 접근 허용.
  // 그 외 /app 경로로 오면 결제 화면으로 되돌린다. (심사관에게 결제 flow만 노출)
  if (
    user?.email === REVIEW_ACCOUNT_EMAIL &&
    request.nextUrl.pathname.startsWith("/app") &&
    !request.nextUrl.pathname.startsWith("/app/billing")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/app/billing";
    url.search = "";
    const r = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((c) =>
      r.cookies.set(c.name, c.value, c),
    );
    return r;
  }

  // supabaseResponse 를 그대로 반환해야 갱신된 세션 쿠키가 브라우저로 전달된다.
  return supabaseResponse;
}
