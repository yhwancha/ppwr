import Link from "next/link";
import type { ReactNode } from "react";

const LINKS = [
  { href: "/terms", label: "이용약관" },
  { href: "/privacy", label: "개인정보처리방침" },
  { href: "/refund", label: "취소·환불 규정" },
];

/** 약관/정책 공통 레이아웃 (마케팅 헤더/푸터 안에서 렌더) */
export default function LegalShell({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-slate-50">
      <div className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-extrabold text-ink">{title}</h1>
        <p className="mt-2 text-sm text-slate-400">최종 개정일 · {updatedAt}</p>

        <nav className="mt-6 flex flex-wrap gap-2">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-500 hover:border-primary hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="legal mt-8 space-y-7 text-sm leading-relaxed text-slate-600">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Article({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-base font-bold text-ink">{heading}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
