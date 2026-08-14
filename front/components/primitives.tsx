import Link from "next/link";
import type { ReactNode } from "react";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
      {children}
    </span>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "primary" | "warning" | "danger" | "success" | "accent";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-slate-100 text-slate-600",
    primary: "bg-primary-soft text-primary",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-danger",
    success: "bg-emerald-50 text-emerald-700",
    accent: "bg-accent-soft text-accent",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

/**
 * 사이트맵 점검으로 추가된 신규 반영분(포장 개선 요청 · 알림)을 표시하는 배지.
 * accent(보라) 컬러로 기존 기능과 시각적으로 구분한다.
 */
export function NewBadge({ children = "신규 반영" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      {children}
    </span>
  );
}

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "soft" | "outline" | "ghost" | "accent" | "accentSoft";
  className?: string;
};

export function Button({
  children,
  href,
  variant = "primary",
  className,
}: ButtonProps) {
  const variants: Record<string, string> = {
    primary: "bg-primary text-white hover:bg-primary-dark",
    soft: "bg-primary-soft text-primary hover:bg-primary-light/60",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-50",
    ghost: "text-slate-600 hover:text-primary",
    accent: "bg-accent text-white hover:bg-accent-dark",
    accentSoft: "bg-accent-soft text-accent hover:bg-accent/15",
  };
  const cls = cx(
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors",
    variants[variant],
    className,
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return <button className={cls}>{children}</button>;
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("mx-auto w-full max-w-6xl px-6", className)}>
      {children}
    </div>
  );
}
