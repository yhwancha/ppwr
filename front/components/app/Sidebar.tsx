"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  Boxes,
  CreditCard,
  FileText,
  LayoutGrid,
  Package,
  Settings,
} from "lucide-react";
import { useSession } from "@/src/features/auth/session";
import { REVIEW_ACCOUNT_EMAIL } from "@/src/shared/payments/config";

type Item = { label: string; href: string; icon: React.ElementType; ready?: boolean };
type Group = { title: string; items: Item[] };

/**
 * 역할별 IA 그룹핑:
 *   진단(워크플로우) · 데이터(마스터) · 산출물 · 계정
 * 제품·부자재는 각각 재사용 마스터라 '데이터'로 묶고, 진단은 이를 불러오는 작업,
 * 산출물(문서·리포트)은 별도로 둔다. (PpwrComponentService master/instance 구조와 정렬)
 */
const groups: Group[] = [
  {
    title: "진단",
    items: [
      { label: "대시보드", href: "/app", icon: LayoutGrid, ready: true },
      { label: "진단 워크스페이스", href: "/app/diagnosis", icon: Activity },
    ],
  },
  {
    title: "데이터",
    items: [
      { label: "제품 (SKU)", href: "/app/products", icon: Package, ready: true },
      { label: "부품 라이브러리", href: "/app/components", icon: Boxes, ready: true },
    ],
  },
  {
    title: "산출물",
    items: [{ label: "문서·리포트", href: "/app/reports", icon: FileText }],
  },
  {
    title: "계정",
    items: [
      { label: "결제·구독", href: "/app/billing", icon: CreditCard, ready: true },
      { label: "리소스", href: "/app/resources", icon: BookOpen },
      { label: "설정", href: "/app/settings", icon: Settings },
    ],
  },
];

// PG 심사 계정: 결제 메뉴만 노출
const reviewerGroups: Group[] = [
  {
    title: "결제",
    items: [{ label: "결제", href: "/app/billing", icon: CreditCard, ready: true }],
  },
];

export default function Sidebar() {
  const pathname = usePathname() ?? "";
  const { user } = useSession();
  const isReviewer = user?.email === REVIEW_ACCOUNT_EMAIL;
  const navGroups = isReviewer ? reviewerGroups : groups;

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

      {/* 그룹 네비 */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {navGroups.map((g) => (
          <div key={g.title} className="space-y-1">
            <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-300">
              {g.title}
            </p>
            {g.items.map(renderItem)}
          </div>
        ))}
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
