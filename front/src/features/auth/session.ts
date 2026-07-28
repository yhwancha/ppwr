"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/src/shared/api";

export type SessionUser = { id: string; email?: string };

/** 현재 로그인 세션을 구독하는 훅. 로그인/로그아웃 시 자동 갱신. */
export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = getSupabaseClient();
    let mounted = true;

    sb.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(
        data.user ? { id: data.user.id, email: data.user.email ?? undefined } : null,
      );
      setLoading(false);
    });

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_event, sessionState) => {
      setUser(
        sessionState?.user
          ? { id: sessionState.user.id, email: sessionState.user.email ?? undefined }
          : null,
      );
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}

/** 로그아웃 (세션 쿠키 제거) */
export async function signOut() {
  await getSupabaseClient().auth.signOut();
}
