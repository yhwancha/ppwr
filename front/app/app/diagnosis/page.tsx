"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Clock,
  Info,
  LayoutGrid,
  PencilLine,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";
import Topbar from "@/components/app/Topbar";
import DiagnosisCard from "@/components/diagnosis/DiagnosisCard";
import { EntryFeed, ReportFeed } from "@/components/diagnosis/FeedPanel";
import { getPpwrDiagnosisService } from "@/src/shared/api";
import type { DiagnosisItem, DiagnosisStatus } from "@/src/lib/ppwr-diagnosis-service";

const tabs: { key: "all" | DiagnosisStatus; label: string; icon: React.ElementType }[] = [
  { key: "all", label: "전체", icon: LayoutGrid },
  { key: "draft", label: "임시 저장", icon: PencilLine },
  { key: "in_progress", label: "진행 중", icon: Clock },
  { key: "needs_supplement", label: "보완 필요", icon: AlertTriangle },
  { key: "confirmed", label: "진단 확정", icon: ShieldCheck },
];

/** 상태별로 피드 빈 상태 문구가 달라진다 (Figma 시안) */
function emptyMessages(status: DiagnosisStatus | undefined) {
  if (status === "in_progress") {
    return {
      entry: "진단이 완료되면 진단 결과에 따른 보완내용이 표시됩니다.",
      report: "진단이 완료되면 리포트 관련내용이 표시됩니다.",
    };
  }
  if (status === "draft") {
    return {
      entry: "입력이 필요한 항목이 없습니다.",
      report: "진단이 완료되면 리포트 관련내용이 표시됩니다.",
    };
  }
  return {
    entry: "수정할 항목이 없습니다.",
    report: "진단이 완료되면 리포트 관련내용이 표시됩니다.",
  };
}

export default function DiagnosisPage() {
  const [tab, setTab] = useState<"all" | DiagnosisStatus>("all");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const { data, isLoading, error } = useQuery({
    queryKey: ["ppwr", "diagnosis"],
    queryFn: () => getPpwrDiagnosisService().list(),
  });

  const items = useMemo<DiagnosisItem[]>(() => {
    let r = data ?? [];
    if (tab !== "all") r = r.filter((i) => i.status === tab);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      r = r.filter(
        (i) =>
          i.name.toLowerCase().includes(s) ||
          (i.sku ?? "").toLowerCase().includes(s) ||
          String(i.productId).includes(s),
      );
    }
    return r;
  }, [data, tab, q]);

  const summary = useMemo(() => {
    const all = data ?? [];
    if (all.length === 0) return { total: 0, overallProgress: 0 };
    return {
      total: all.length,
      overallProgress: Math.round(
        all.reduce((acc, i) => acc + i.progress, 0) / all.length,
      ),
    };
  }, [data]);

  // 선택된 카드가 필터에서 빠지면 목록의 첫 항목으로 되돌린다
  const selected = items.find((i) => i.productId === selectedId) ?? items[0] ?? null;
  const empty = emptyMessages(selected?.status);
  const reportFeed = (selected?.reportFeed ?? []).filter((e) => !dismissed.has(e.id));

  return (
    <>
      <Topbar crumbs={[{ label: "진단 관리" }]} />
      <div className="px-8 pb-24">
        {/* 헤더 */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="inline-flex items-center gap-2 text-2xl font-extrabold text-ink">
            진단 관리
            <span
              title="제품별 PPWR 진단 진행 상태를 한 곳에서 관리합니다."
              className="text-slate-300"
            >
              <Info className="h-4 w-4" />
            </span>
          </h1>
          <Link
            href="/app/diagnosis/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-ink-soft"
          >
            <Plus className="h-4 w-4" /> 진단 시작
          </Link>
        </div>

        {/* 통계 */}
        <div className="mt-4 inline-flex items-center gap-6 rounded-xl border border-slate-200 bg-white px-6 py-4">
          <span className="text-sm text-slate-500">
            총 진단 제품 <b className="ml-1.5 text-ink">{summary.total}건</b>
          </span>
          <span className="text-sm text-slate-500">
            종합 진행률 <b className="ml-1.5 text-ink">{summary.overallProgress}%</b>
          </span>
        </div>

        {/* 상태 탭 + 검색 */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={
                    "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-colors " +
                    (active
                      ? "bg-ink text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50")
                  }
                >
                  <Icon className="h-4 w-4" /> {t.label}
                </button>
              );
            })}
          </div>
          <div className="ml-auto flex min-w-[280px] flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="제품명, 제품 ID, SKU 검색"
              className="w-full text-sm outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {error && (
          <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-danger">
            진단 목록을 불러오지 못했습니다. {(error as Error).message}
          </p>
        )}

        {/* 좌: 목록 / 우: 피드 */}
        <div className="mt-4 grid gap-8 lg:grid-cols-[420px_minmax(0,1fr)]">
          <div>
            <h2 className="text-base font-bold text-ink">진단 관리 중인 제품</h2>
            <div className="mt-3 max-h-[calc(100vh-22rem)] space-y-3 overflow-y-auto pr-2">
              {isLoading && <p className="py-10 text-center text-sm text-slate-400">불러오는 중…</p>}
              {!isLoading && items.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-200 py-14 text-center text-sm text-slate-400">
                  진단 중인 제품이 없습니다.
                </p>
              )}
              {items.map((item) => (
                <DiagnosisCard
                  key={item.productId}
                  item={item}
                  selected={selected?.productId === item.productId}
                  onSelect={() => setSelectedId(item.productId)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <EntryFeed
              title="제품 피드"
              action={
                selected
                  ? { label: "제품 정보", href: `/app/products/${selected.productId}` }
                  : undefined
              }
              entries={selected?.productFeed ?? []}
              emptyMessage={empty.entry}
              requiredNotice={selected?.status === "draft"}
            />
            <EntryFeed
              title="부품 피드"
              action={
                selected
                  ? { label: "부품 정보", href: `/app/products/${selected.productId}` }
                  : undefined
              }
              entries={selected?.componentFeed ?? []}
              emptyMessage={empty.entry}
              requiredNotice={selected?.status === "draft"}
            />
            <ReportFeed
              entries={reportFeed}
              emptyMessage={empty.report}
              onDismiss={(id) => setDismissed((prev) => new Set(prev).add(id))}
            />
          </div>
        </div>
      </div>
    </>
  );
}
