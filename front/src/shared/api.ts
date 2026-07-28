import { AuthService, PpwrProductService } from "@restudio/supabase";
import { createClient } from "@/src/shared/supabase/client";

/**
 * RESTUDIO와 동일한 Supabase 브라우저(쿠키 세션) 클라이언트를 공유한다.
 * RLS가 세션의 auth.uid()를 기준으로 본인 데이터만 허용한다.
 */
let _client: ReturnType<typeof createClient> | null = null;
function client() {
  if (!_client) _client = createClient();
  return _client;
}

/** 공유 브라우저 Supabase 클라이언트 (세션·인증 상태 조회용) */
export function getSupabaseClient() {
  return client();
}

let _authService: AuthService | null = null;
export function getAuthService(): AuthService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!_authService) _authService = new AuthService(client() as any);
  return _authService;
}

let _productService: PpwrProductService | null = null;
export function getPpwrProductService(): PpwrProductService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!_productService) _productService = new PpwrProductService(client() as any);
  return _productService;
}
