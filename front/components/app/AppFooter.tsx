import Link from "next/link";
import { MERCHANT } from "@/src/shared/payments/config";

/**
 * 워크스페이스(/app/*) 하단 사업자정보 바.
 *
 * 전자상거래법 표시사항은 메인 페이지뿐 아니라 "결제 페이지까지 상시 노출"되어야 한다
 * (PG·카드사 입점심사 필수 요건). /app/* 은 마케팅 Footer 를 쓰지 않으므로
 * 대시보드 톤에 맞춘 경량 푸터를 별도로 둔다.
 *
 * 필수 노출: 상호명 · 대표자명 · 사업자등록번호 · 통신판매업신고번호 · 사업장주소지 · 전화번호(유선)
 */
const LINKS = [
  { href: "/terms", label: "이용약관" },
  { href: "/privacy", label: "개인정보처리방침" },
  { href: "/refund", label: "취소·환불 규정" },
];

export default function AppFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200 px-8 py-8">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="text-sm font-bold text-ink">
          {MERCHANT.companyName}
        </span>
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            target="_blank"
            className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-primary hover:underline"
          >
            {l.label}
          </Link>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-slate-500">
        <span>대표 {MERCHANT.ceo}</span>
        <Divider />
        <span>사업자등록번호 {MERCHANT.bizRegNo}</span>
        <Divider />
        <span>통신판매업신고 {MERCHANT.mailOrderNo}</span>
        <Divider />
        <span>개인정보보호책임자 {MERCHANT.privacyOfficer}</span>
      </div>

      <p className="mt-1.5 text-xs text-slate-500">
        {MERCHANT.address}
      </p>
      <p className="mt-1.5 text-xs text-slate-500">
        고객센터 {MERCHANT.tel} · {MERCHANT.email}
      </p>

      <p className="mt-4 text-xs text-slate-400">
        © 2026 {MERCHANT.companyNameEn}. All rights reserved.
      </p>
    </footer>
  );
}

function Divider() {
  return <span className="text-slate-300">|</span>;
}
