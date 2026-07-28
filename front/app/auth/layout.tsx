import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-ink">
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(64,96,96,0.45),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(64,96,96,0.25),transparent_50%)]" />

      <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12">
        {/* 브랜드 */}
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <span className="leading-tight text-white">
            <span className="block text-lg font-extrabold">PPWR AI</span>
            <span className="block text-xs font-medium text-slate-300">
              규제 자동진단
            </span>
          </span>
        </Link>

        {/* 카드 */}
        <div className="mt-8 w-full max-w-md rounded-3xl border border-white/10 bg-white p-8 shadow-2xl sm:p-10">
          {children}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          © 2026 PPWR AI · Powered by RESTUDIO
        </p>
      </div>
    </div>
  );
}
