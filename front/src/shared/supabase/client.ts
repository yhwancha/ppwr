import { createBrowserClient } from "@supabase/ssr";

/**
 * 브라우저(클라이언트)용 Supabase 클라이언트.
 * 세션을 쿠키에 저장하여 SSR·미들웨어와 세션을 공유한다. (RESTUDIO web과 동일 패턴)
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    },
  );
}
