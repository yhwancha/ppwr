"use client";

import Link from "next/link";
import { ArrowRight, LayoutGrid, LogIn, ShieldCheck } from "lucide-react";
import { useSession } from "@/src/features/auth/session";

export default function HomePage() {
  const { user, loading } = useSession();

  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(64,96,96,0.45),transparent_55%)]" />
      <div className="relative mx-auto flex min-h-[70vh] w-full max-w-4xl flex-col items-start justify-center px-6 py-24">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <span className="mt-6 inline-flex rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-primary-light">
          EU 2025/40 PPWR 대응 솔루션
        </span>
        <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-6xl">
          EU 포장폐기물 규정,
          <br />
          AI로 미리 진단하고 대응하세요
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
          제품과 포장 구조를 입력하면 규제 미이행 리스크를 진단하고, 공급사 제출용
          자료까지 매핑해 드립니다.
        </p>

        <div className="mt-8 flex min-h-[52px] flex-wrap items-center gap-3">
          {loading ? null : user ? (
            <>
              <span className="text-sm text-slate-300">
                {user.email} 님, 환영합니다.
              </span>
              <Link
                href="/app"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                <LayoutGrid className="h-4 w-4" /> 대시보드로 이동
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                <LogIn className="h-4 w-4" /> 로그인
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
