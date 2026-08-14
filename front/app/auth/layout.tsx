import Link from "next/link";
import { Check } from "lucide-react";

const highlights = [
  "제품·포장재 정보 한 번 입력으로 진단부터 문서까지",
  "AI 사전진단으로 PPWR 리스크·누락자료 즉시 확인",
  "TD·DoC·EPR 기초자료를 연결된 데이터로 발행",
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* ── 좌: 브랜드 패널 (데스크톱) ── */}
      <aside className="relative hidden w-[46%] overflow-hidden bg-ink text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(120,150,130,0.35),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_90%,rgba(120,150,130,0.20),transparent_50%)]" />

        <div className="relative px-12 pt-12">
          <Link href="/" className="inline-flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="RESTUDIO"
              className="h-5 w-auto brightness-0 invert"
            />
          </Link>
        </div>

        <div className="relative px-12 pb-16">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            EU 포장폐기물 규정(PPWR),
            <br />
            AI로 미리 준비하세요
          </h2>
          <ul className="mt-8 space-y-3.5">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 text-sm text-slate-200">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <Check className="h-3 w-3 text-white" />
                </span>
                {h}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative px-12 pb-8 text-xs text-slate-400">
          © 2026 PPWR AI · Powered by RESTUDIO
        </div>
      </aside>

      {/* ── 우: 폼 패널 ── */}
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* 모바일 로고 */}
          <Link href="/" className="mb-10 flex items-center justify-center lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="RESTUDIO" className="h-5 w-auto" />
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
