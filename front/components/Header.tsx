"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LayoutGrid } from "lucide-react";
import { signOut, useSession } from "@/src/features/auth/session";

export default function Header() {
  const { user, loading } = useSession();
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center">
          <img
            src="/logo.svg"
            alt="RESTUDIO"
            className="h-4 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link
            href="/service"
            className="text-sm font-semibold text-slate-600 transition-colors hover:text-primary"
          >
            서비스 소개
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-semibold text-slate-600 transition-colors hover:text-primary"
          >
            요금제
          </Link>
          <Link
            href="/app/billing"
            className="text-sm font-semibold text-slate-600 transition-colors hover:text-primary"
          >
            결제·구독
          </Link>
        </nav>

        <div className="flex min-h-9 items-center gap-3">
          {loading ? null : user ? (
            <>
              <span className="hidden text-sm font-medium text-slate-500 md:inline">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="hidden text-sm font-semibold text-slate-600 transition-colors hover:text-primary sm:inline"
              >
                로그아웃
              </button>
              <Link
                href="/app"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                <LayoutGrid className="h-4 w-4" /> 대시보드로 이동
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hidden text-sm font-semibold text-slate-600 transition-colors hover:text-primary sm:inline"
              >
                로그인
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                회원가입
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
