import { createClient } from "@supabase/supabase-js";

/**
 * 서버 전용 service_role Supabase 클라이언트.
 * RLS 를 우회하므로 **신뢰된 서버 라우트(결제 검증/웹훅)에서만** 사용한다.
 * ppwr."Payment" 등은 RLS 상 admin/service_role 만 쓰기 가능하므로, 고객 결제 적재는
 * 반드시 이 클라이언트로 한다. (SUPABASE_SERVICE_ROLE_KEY 는 절대 NEXT_PUBLIC_ 금지)
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE 서버 자격 누락: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 확인",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
