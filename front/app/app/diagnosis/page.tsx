"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { ConfirmDialog } from "@/components/ui/Dialog";
import { GENERIC_ERROR, useToast } from "@/components/ui/Toast";
import DiagnosisCard from "@/components/diagnosis/DiagnosisCard";
import { EntryFeed, OverviewList, ReportFeed, type OverviewRow } from "@/components/diagnosis/FeedPanel";
import { getPpwrDiagnosisService, getPpwrEvidenceService } from "@/src/shared/api";
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
  const [pendingDelete, setPendingDelete] = useState<DiagnosisItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const qc = useQueryClient();
  const toast = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["ppwr", "diagnosis"],
    queryFn: () => getPpwrDiagnosisService().list(),
  });

  // 카드 썸네일 — 제품 목록과 같은 방식으로 첫 사진의 서명 URL 을 따로 받는다.
  // (목록 질의와 분리해 두면 URL 만료 시 이 질의만 다시 돌면 된다)
  const photoKeys = useMemo(
    () => [...new Set((data ?? []).map((i) => i.photoKey).filter((k): k is string => !!k))],
    [data],
  );
  const { data: thumbs } = useQuery({
    queryKey: ["ppwr", "diagnosis", "thumbs", photoKeys],
    queryFn: () => getPpwrEvidenceService().signedUrls(photoKeys),
    enabled: photoKeys.length > 0,
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

  // 시안대로 처음에는 아무것도 선택하지 않는다 — 우측은 안내 문구만 뜬다.
  // 선택한 카드가 필터에서 빠지면 다시 미선택으로 돌아간다.
  const selected = items.find((i) => i.productId === selectedId) ?? null;
  const empty = emptyMessages(selected?.status);
  const reportFeed = (selected?.reportFeed ?? []).filter((e) => !dismissed.has(e.id));

  // 하단 두 목록은 선택과 무관하게 전 제품을 모아 본다
  const supplementRows = useMemo<OverviewRow[]>(
    () =>
      (data ?? [])
        .flatMap((i) =>
          [...i.productFeed, ...i.componentFeed].map((e) => ({
            id: `${i.productId}-${e.id}`,
            product: i.name,
            message: e.message,
            at: e.at ?? i.updatedAt,
          })),
        )
        .sort((a, b) => String(b.at ?? "").localeCompare(String(a.at ?? ""))),
    [data],
  );

  const logRows = useMemo<OverviewRow[]>(
    () =>
      (data ?? [])
        .flatMap((i) =>
          i.reportFeed.map((e) => ({
            id: `${i.productId}-${e.id}`,
            product: i.name,
            message: e.message,
            at: e.at,
          })),
        )
        .sort((a, b) => String(b.at ?? "").localeCompare(String(a.at ?? ""))),
    [data],
  );

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await getPpwrDiagnosisService().reset(pendingDelete.productId);
      if (selectedId === pendingDelete.productId) setSelectedId(null);
      await qc.invalidateQueries({ queryKey: ["ppwr", "diagnosis"] });
      toast.show("success", "진단 결과를 초기화했습니다.");
      setPendingDelete(null);
    } catch (e) {
      toast.show("danger", e instanceof Error ? e.message : GENERIC_ERROR);
    } finally {
      setDeleting(false);
    }
  }

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
                  아직 진단 관리 중인 제품이 없습니다.
                </p>
              )}
              {items.map((item) => (
                <DiagnosisCard
                  key={item.productId}
                  item={item}
                  thumbUrl={item.photoKey ? thumbs?.get(item.photoKey) : undefined}
                  selected={selected?.productId === item.productId}
                  onSelect={() => setSelectedId(item.productId)}
                  onDelete={() => setPendingDelete(item)}
                />
              ))}
            </div>
          </div>

          {selected ? (
            <div className="space-y-8">
              <EntryFeed
                title="제품 피드"
                action={{ label: "제품 정보", href: `/app/products/${selected.productId}` }}
                entries={selected.productFeed}
                emptyMessage={empty.entry}
                requiredNotice={selected.status === "draft"}
              />
              <EntryFeed
                title="부품 피드"
                action={{ label: "부품 정보", href: `/app/products/${selected.productId}` }}
                entries={selected.componentFeed}
                emptyMessage={empty.entry}
                requiredNotice={selected.status === "draft"}
              />
              <ReportFeed
                entries={reportFeed}
                emptyMessage={empty.report}
                onDismiss={(id) => setDismissed((prev) => new Set(prev).add(id))}
              />
            </div>
          ) : (
            /* 시안: 아무것도 고르지 않았을 때는 안내 문구만 */
            <section className="flex flex-col">
              <h2 className="text-base font-bold text-ink">제품 피드</h2>
              <div className="mt-3 flex min-h-[420px] flex-1 items-center justify-center rounded-xl bg-slate-200/60 px-6 text-center text-sm text-slate-500">
                왼쪽에서 제품을 선택하면 여기에 제품에 대한 피드 내용이 표시됩니다.
              </div>
            </section>
          )}
        </div>

        {/* 하단: 전 제품 기준 요약 2열 */}
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <OverviewList
            title="보완해야 할 내용"
            count={supplementRows.length}
            rows={supplementRows}
            emptyMessage="보완해야 할 내용이 없습니다."
          />
          <OverviewList
            title="최근 진행 로그"
            rows={logRows}
            emptyMessage="진행 로그가 없습니다."
          />
        </div>
      </div>

      <ConfirmDialog
        open={pendingDelete != null}
        title="이 제품의 진단 결과를 초기화할까요?"
        description={
          <>
            진단 결과와 리포트 발행기록이 모두 삭제되고 상태가 &ldquo;임시 저장&rdquo;으로 돌아갑니다.
            <br />
            제품·부품·첨부 서류는 그대로 유지되며, 목록에서 사라지지 않습니다.
          </>
        }
        confirmLabel="초기화"
        // 안내 첫 줄이 한 줄에 들어가야 해서 기본 폭(max-w-md)보다 넓힌다
        width="max-w-xl"
        pending={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}
