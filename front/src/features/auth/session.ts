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

    // 초기 세션 조회: getSession()은 스토리지에서 읽어 세션이 없어도 정상 resolve 한다.
    // (getUser()는 세션이 없으면 reject 되어 loading 이 안 풀리는 문제가 있었음)
    sb.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        const u = data.session?.user;
        setUser(u ? { id: u.id, email: u.email ?? undefined } : null);
        setLoading(false);
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_event, sessionState) => {
      if (!mounted) return;
      setUser(
        sessionState?.user
          ? { id: sessionState.user.id, email: sessionState.user.email ?? undefined }
          : null,
      );
      setLoading(false);
    });

    // 안전장치: 세션 확인이 지연·실패해도 UI가 영구히 멈추지 않도록.
    const timer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}

/** 로그아웃 (세션 쿠키 제거) */
export async function signOut() {
  await getSupabaseClient().auth.signOut();
}
