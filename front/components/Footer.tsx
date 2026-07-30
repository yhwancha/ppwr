import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { MERCHANT } from "@/src/shared/payments/config";

const legalLinks = [
  { href: "/terms", label: "이용약관" },
  { href: "/privacy", label: "개인정보처리방침" },
  { href: "/refund", label: "취소·환불 규정" },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-ink text-slate-300">
      <div className="mx-auto w-full max-w-7xl px-6 py-14">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <span className="text-lg font-extrabold text-white">{MERCHANT.serviceName}</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              EU 포장폐기물 규정(PPWR)에 제품 포장이 적합한지 AI로 미리 진단하고, 공급사
              제출용 자료까지 매핑해 드립니다.
            </p>
          </div>

          {/* 약관/정책 링크 */}
          <nav className="flex flex-col gap-2 text-sm">
            {legalLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-slate-400 hover:text-white">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* 사업자 정보 (전자상거래법 표시사항) */}
        <div className="mt-10 space-y-1 text-xs leading-relaxed text-slate-500">
          <p>
            <span className="text-slate-400">{MERCHANT.companyName}</span> · 대표 {MERCHANT.ceo}
          </p>
          <p>
            사업자등록번호 {MERCHANT.bizRegNo} · 통신판매업신고 {MERCHANT.mailOrderNo}
          </p>
          <p>{MERCHANT.address}</p>
          <p>
            고객센터 {MERCHANT.tel} · {MERCHANT.email}
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto w-full max-w-7xl px-6 py-6 text-xs text-slate-500">
          © 2026 {MERCHANT.serviceName} · Powered by RESTUDIO. EU 2025/40 PPWR 대응 솔루션.
        </div>
      </div>
    </footer>
  );
}
