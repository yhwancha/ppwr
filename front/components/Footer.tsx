import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { MERCHANT } from "@/src/shared/payments/config";
import { BASE_PATH } from "@/src/shared/base-path";

const columns: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "서비스",
    links: [
      { href: "/", label: "서비스 소개" },
      { href: "/app", label: "진단 시작하기" },
      { href: "/app/billing", label: "요금제·결제" },
    ],
  },
  {
    title: "약관·정책",
    links: [
      { href: "/terms", label: "이용약관" },
      { href: "/privacy", label: "개인정보처리방침" },
      { href: "/refund", label: "취소·환불 규정" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 bg-ink text-slate-300">
      <div className="mx-auto w-full max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* 브랜드 */}
          <div>
            <div className="flex items-center">
              <img
                src={`${BASE_PATH}/logo.svg`}
                alt="RESTUDIO"
                className="h-4 w-auto brightness-0 invert"
              />
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-400">
              EU 포장폐기물 규정(PPWR)에 제품 포장이 적합한지 AI로 미리 진단하고,
              공급사 제출용 자료까지 매핑해 드립니다.
            </p>
          </div>

          {/* 링크 컬럼 */}
          {columns.map((col) => (
            <nav key={col.title} className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-slate-500">
                {col.title}
              </h3>
              {col.links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          ))}

          {/* 문의 */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-slate-500">
              고객문의
            </h3>
            <p className="flex items-start gap-2 text-sm text-slate-400">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
              {MERCHANT.address}
            </p>
            <a
              href={`tel:${MERCHANT.tel.replace(/[^0-9]/g, "")}`}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white"
            >
              <Phone className="h-4 w-4 shrink-0 text-slate-500" />
              {MERCHANT.tel}
            </a>
            <a
              href={`mailto:${MERCHANT.email}`}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white"
            >
              <Mail className="h-4 w-4 shrink-0 text-slate-500" />
              {MERCHANT.email}
            </a>
          </div>
        </div>

        {/* 사업자 정보 (전자상거래법 표시사항) */}
        <div className="mt-14 border-t border-white/10 pt-8">
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-400">{MERCHANT.companyName}</span>
            <Divider />
            <span>대표 {MERCHANT.ceo}</span>
            <Divider />
            <span>사업자등록번호 {MERCHANT.bizRegNo}</span>
            <Divider />
            <span>통신판매업신고 {MERCHANT.mailOrderNo}</span>
            <Divider />
            <span>개인정보보호책임자 {MERCHANT.privacyOfficer}</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {MERCHANT.address} · 고객센터 {MERCHANT.tel} · {MERCHANT.email}
          </p>
          <p className="mt-5 text-xs text-slate-600">
            © 2026 {MERCHANT.companyNameEn}. All rights reserved. {MERCHANT.serviceName}
            {" "}for EU 2025/40 PPWR.
          </p>
        </div>
      </div>
    </footer>
  );
}

function Divider() {
  return <span className="text-slate-700">|</span>;
}
