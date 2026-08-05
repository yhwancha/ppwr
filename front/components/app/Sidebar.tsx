"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  Boxes,
  CreditCard,
  LayoutGrid,
  Package,
  Settings,
} from "lucide-react";
import { useSession } from "@/src/features/auth/session";

type Item = { label: string; href: string; icon: React.ElementType; ready?: boolean };

const mainNav: Item[] = [
  { label: "대시보드", href: "/app", icon: LayoutGrid, ready: true },
  { label: "제품 관리", href: "/app/products", icon: Package, ready: true },
  { label: "부품 관리", href: "/app/components", icon: Boxes, ready: true },
  { label: "진단 관리", href: "/app/diagnosis", icon: Activity },
];

const subNav: Item[] = [
  { label: "결제·구독", href: "/app/billing", icon: CreditCard, ready: true },
  { label: "리소스", href: "/app/resources", icon: BookOpen },
  { label: "설정", href: "/app/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname() ?? "";
  const { user } = useSession();

  function renderItem(s: Item) {
    const active =
      s.href === "/app" ? pathname === "/app" : pathname.startsWith(s.href);
    const Icon = s.icon;
    return (
      <Link
        key={s.href}
        href={s.href}
        className={
          "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors " +
          (active
            ? "bg-primary-soft text-primary"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700")
        }
      >
        {active && (
          <span className="absolute inset-y-1 left-0 w-1 rounded-r bg-primary" />
        )}
        <Icon className="h-5 w-5 shrink-0" />
        <span className="flex-1">{s.label}</span>
        {!s.ready && (
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-400">
            준비중
          </span>
        )}
      </Link>
    );
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-slate-200 bg-white">
      {/* 로고 */}
      <Link href="/" className="flex items-baseline gap-2 px-6 py-7">
        <span className="text-xl font-black tracking-tight text-ink">RESTUDIO</span>
        <span className="text-sm font-bold text-primary">PPWR</span>
      </Link>

      {/* 메인 네비 */}
      <nav className="flex-1 space-y-1 px-3">
        {mainNav.map(renderItem)}
        <div className="my-3 border-t border-slate-100" />
        {subNav.map(renderItem)}
      </nav>

      {/* 하단 유저 */}
      <div className="border-t border-slate-100 px-6 py-5">
        <p className="text-sm font-bold text-ink">테스트</p>
        <p className="mt-0.5 truncate text-xs text-slate-400">
          {user?.email ?? "name@company.com"}
        </p>
      </div>
    </aside>
  );
}
