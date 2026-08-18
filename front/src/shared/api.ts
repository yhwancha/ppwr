import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/src/shared/supabase/client";
import type { Database } from "@/src/types/database.types";
import { PpwrProductService } from "@/src/lib/ppwr-product-service";
import { PpwrPackagingService } from "@/src/lib/ppwr-packaging-service";
import { PpwrComponentService } from "@/src/lib/ppwr-component-service";
import { PpwrEvidenceService } from "@/src/lib/ppwr-evidence-service";

/**
 * RESTUDIO와 동일한 Supabase 브라우저(쿠키 세션) 클라이언트를 공유한다.
 * RLS가 세션의 auth.uid()를 기준으로 본인 데이터만 허용한다.
 *
 * (모노레포 @restudio/supabase 의존을 제거하고, 프론트에서 실제로 쓰는
 *  AuthService 최소 구현만 인라인한다. PpwrProductService는 repo 내부로 복사.)
 */
let _client: SupabaseClient<Database> | null = null;
function client(): SupabaseClient<Database> {
  if (!_client) _client = createClient() as unknown as SupabaseClient<Database>;
  return _client;
}

/** 공유 브라우저 Supabase 클라이언트 (세션·인증 상태 조회용) */
export function getSupabaseClient() {
  return client();
}

/** 로그인에 필요한 최소 인증 서비스 (@restudio/supabase AuthService 대체) */
class AuthService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /** 이메일+비밀번호 로그인 → public."User" row 반환 */
  async signInEmailWithPassword(email: string, password: string) {
    const { data } = await this.supabase.auth.signInWithPassword({ email, password });
    const { data: user } = await this.supabase
      .from("User")
      .select()
      .eq("auth_id", data.user?.id ?? "")
      .single();
    if (!user) throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    return user as Database["public"]["Tables"]["User"]["Row"];
  }

  /** OAuth 로그인 (리다이렉트) */
  async signInWithOauth(provider: "google", redirectTo: string) {
    await this.supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
  }
}

let _authService: AuthService | null = null;
export function getAuthService() {
  if (!_authService) _authService = new AuthService(client());
  return _authService;
}

let _productService: PpwrProductService | null = null;
export function getPpwrProductService() {
  if (!_productService) _productService = new PpwrProductService(client());
  return _productService;
}

let _packagingService: PpwrPackagingService | null = null;
export function getPpwrPackagingService() {
  if (!_packagingService) _packagingService = new PpwrPackagingService(client());
  return _packagingService;
}

let _componentService: PpwrComponentService | null = null;
export function getPpwrComponentService() {
  if (!_componentService) _componentService = new PpwrComponentService(client());
  return _componentService;
}

let _evidenceService: PpwrEvidenceService | null = null;
export function getPpwrEvidenceService() {
  if (!_evidenceService) _evidenceService = new PpwrEvidenceService(client());
  return _evidenceService;
}
