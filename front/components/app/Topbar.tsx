import Link from "next/link";
import { Bell, ChevronRight, Home } from "lucide-react";

export type Crumb = { label: string; href?: string };

/** Figma 시안: 상단 브레드크럼 바(테두리 박스) + 우측 알림 벨 */
export default function Topbar({ crumbs = [] }: { crumbs?: Crumb[] }) {
  return (
    <div className="sticky top-0 z-30 flex items-center gap-4 bg-slate-50/95 px-8 py-4 backdrop-blur">
      <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3">
        <Link href="/app" className="text-slate-400 hover:text-primary">
          <Home className="h-4 w-4" />
        </Link>
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-slate-300" />
            {c.href ? (
              <Link
                href={c.href}
                className="text-sm font-semibold text-slate-500 hover:text-primary"
              >
                {c.label}
              </Link>
            ) : (
              <span className="text-sm font-semibold text-ink">{c.label}</span>
            )}
          </span>
        ))}
      </div>
      <Link
        href="/app/notifications"
        aria-label="알림"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-primary"
      >
        <Bell className="h-5 w-5" />
      </Link>
    </div>
  );
}
