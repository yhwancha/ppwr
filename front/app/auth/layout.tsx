import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#f7faf7]">
      {/* 은은한 포레스트 그린 글로우 (랜딩 톤) */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(67,85,74,0.10),transparent_60%)]" />

      <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12">
        {/* 브랜드 */}
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="RESTUDIO" className="h-5 w-auto" />
        </Link>

        {/* 카드 */}
        <div className="mt-8 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          {children}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          © 2026 PPWR AI · Powered by RESTUDIO
        </p>
      </div>
    </div>
  );
}
