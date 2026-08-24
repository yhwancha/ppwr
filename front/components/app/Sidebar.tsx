"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ClipboardList,
  CreditCard,
  Layers,
  LayoutGrid,
  Package,
  Settings,
  SquareActivity,
} from "lucide-react";
import { useSession } from "@/src/features/auth/session";
import { REVIEW_ACCOUNT_EMAIL } from "@/src/shared/payments/config";

type SubItem = { label: string; href: string };
type Item = {
  label: string;
  href: string;
  icon: React.ElementType;
  children?: SubItem[];
};

/**
 * 시안 사이드바 — 그룹 헤더 없는 평평한 목록이고, 설정만 2뎁스로 펼쳐진다.
 *
 * 이전에는 진단·데이터·산출물·계정 4그룹으로 묶여 있었으나 시안에 그룹 라벨이
 * 없어 걷어냈다. 순서는 워크플로우 순서(대시보드 → 진단 → 마스터 → 산출물 → 계정) 그대로다.
 *
 * 구분선 아래가 두 번째 섹션이다.
 */
const sections: Item[][] = [
  [
    { label: "대시보드", href: "/app", icon: LayoutGrid },
    { label: "진단 관리", href: "/app/diagnosis", icon: SquareActivity },
    { label: "제품 관리", href: "/app/products", icon: Package },
    { label: "부품 관리", href: "/app/components", icon: Layers },
    { label: "리포트 관리", href: "/app/reports", icon: ClipboardList },
    { label: "결제 / 구독", href: "/app/billing", icon: CreditCard },
  ],
  [
    {
      label: "설정",
      href: "/app/settings",
      icon: Settings,
      children: [
        { label: "프로필 관리", href: "/app/settings/profile" },
        { label: "팀원 / 권한 관리", href: "/app/settings/members" },
        { label: "보안 설정", href: "/app/settings/security" },
      ],
    },
  ],
];

/** PG 심사 계정: 결제 메뉴만 노출 */
const reviewerSections: Item[][] = [
  [{ label: "결제", href: "/app/billing", icon: CreditCard }],
];

export default function Sidebar() {
  const pathname = usePathname() ?? "";
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const { user } = useSession();
  const isReviewer = user?.email === REVIEW_ACCOUNT_EMAIL;
  const navSections = isReviewer ? reviewerSections : sections;

  function renderItem(s: Item) {
    const active = s.href === "/app" ? pathname === "/app" : pathname.startsWith(s.href);
    const Icon = s.icon;
    // 시안은 다른 메뉴가 활성일 때도 설정 하위가 펼쳐져 있다 → 기본 펼침, 접으면 그 선택을 따른다
    const open = s.children ? !collapsed[s.href] : false;
    return (
      <div key={s.href}>
        <Link
          href={s.href}
          className={
            "relative flex items-center gap-3 px-6 py-3 text-sm font-semibold transition-colors " +
            (active ? "bg-slate-50 text-ink" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700")
          }
        >
          {active && <span className="absolute inset-y-0 right-0 w-[3px] bg-ink" />}
          <Icon className="h-5 w-5 shrink-0" />
          <span className="flex-1">{s.label}</span>
          {s.children && (
            <span
              role="button"
              aria-label={open ? `${s.label} 하위 메뉴 접기` : `${s.label} 하위 메뉴 펼치기`}
              onClick={(e) => {
                e.preventDefault();
                setCollapsed((c) => ({ ...c, [s.href]: !collapsed[s.href] }));
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </span>
          )}
        </Link>

        {s.children && open && (
          <div>
            {s.children.map((c) => {
              const subActive = pathname.startsWith(c.href);
              return (
                <Link
                  key={c.href}
                  href={c.href}
                  className={
                    "relative flex items-center py-2.5 pl-14 pr-6 text-sm transition-colors " +
                    (subActive
                      ? "font-semibold text-ink"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700")
                  }
                >
                  {subActive && <span className="absolute inset-y-0 right-0 w-[3px] bg-ink" />}
                  {c.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-slate-200 bg-white">
      {/* 로고 */}
      <Link href="/" className="flex items-baseline gap-2 px-6 py-7">
        <span className="text-xl font-black tracking-tight text-ink">RESTUDIO</span>
        <span className="text-sm font-bold text-primary">PPWR</span>
      </Link>

      <nav className="flex-1 overflow-y-auto pb-4">
        {navSections.map((items, i) => (
          <div key={i}>
            {i > 0 && <div className="mx-6 my-3 border-t border-slate-100" />}
            {items.map(renderItem)}
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
