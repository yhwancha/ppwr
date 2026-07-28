import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-ink text-slate-300">
      <div className="mx-auto w-full max-w-7xl px-6 py-14">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold text-white">PPWR AI</span>
        </div>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
          EU 포장폐기물 규정(PPWR)에 제품 포장이 적합한지 AI로 미리 진단하고, 공급사
          제출용 자료까지 매핑해 드립니다.
        </p>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto w-full max-w-7xl px-6 py-6 text-xs text-slate-500">
          © 2026 PPWR AI · Powered by RESTUDIO. EU 2025/40 PPWR 대응 솔루션.
        </div>
      </div>
    </footer>
  );
}
