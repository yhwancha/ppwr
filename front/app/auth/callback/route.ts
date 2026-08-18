import { NextResponse } from "next/server";
import { createClient } from "@/src/shared/supabase/server";
import { BASE_PATH } from "@/src/shared/base-path";
import { safeRedirect } from "@/src/shared/safe-redirect";

/**
 * OAuth(구글 등) 로그인 콜백.
 * Supabase가 인증 후 이 URL(${origin}${BASE_PATH}/auth/callback)로 code 를 붙여 리다이렉트한다.
 *   - code 를 세션으로 교환(서버 쿠키 설정)
 *   - OAuth 최초 로그인이면 public."User" 행을 보장(앱 서비스가 auth_id→User.id 로 조회하므로)
 *   - 목적지로 리다이렉트 (basePath '/ppwr' 프리픽스 포함)
 *
 * ⚠️ 이 라우트가 없으면 구글 로그인이 code 를 교환할 곳이 없어 세션이 생기지 않는다.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = safeRedirect(searchParams.get("redirect"), "/app");

  if (!code) {
    return NextResponse.redirect(`${origin}${BASE_PATH}/auth/login?error=oauth_no_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}${BASE_PATH}/auth/login?error=oauth_exchange`);
  }

  // OAuth 유저의 public."User" 행 보장 (RESTUDIO는 auth→User 자동 트리거가 없음)
  const u = data.user;
  const { data: existing } = await supabase
    .from("User")
    .select("id")
    .eq("auth_id", u.id)
    .maybeSingle();

  if (!existing) {
    const today = new Date().toISOString().slice(0, 10);
    const name =
      (u.user_metadata?.full_name as string) ||
      (u.user_metadata?.name as string) ||
      (u.email ? u.email.split("@")[0] : "사용자");
    await supabase.from("User").insert({
      auth_id: u.id,
      email: u.email ?? "",
      name,
      role: "user",
      created_at: today,
      updated_at: today,
    });
  }

  return NextResponse.redirect(`${origin}${BASE_PATH}${redirect}`);
}
