"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Trash2 } from "lucide-react";
import type {
  FeedEntry,
  FeedSeverity,
  ReportFeedEntry,
} from "@/src/lib/ppwr-diagnosis-service";

const SEVERITY_CHIP: Record<FeedSeverity, string> = {
  evidence_missing: "bg-amber-50 text-amber-700",
  info_missing: "bg-slate-100 text-slate-500",
  required: "bg-red-50 text-danger",
  recommended: "bg-slate-100 text-slate-500",
};

const SEVERITY_LABEL: Record<FeedSeverity, string> = {
  evidence_missing: "증빙 부족",
  info_missing: "정보 부족",
  required: "필수 보완",
  recommended: "권장 보완",
};

function formatStamp(v: string | null | undefined) {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}. ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-base font-bold text-ink">{title}</h2>
      {action && (
        <Link
          href={action.href}
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

/** 빈 상태 — 회색 박스 안 안내 문구 */
function EmptyBox({ message }: { message: string }) {
  return (
    <div className="mt-3 flex min-h-[160px] flex-1 items-center justify-center rounded-xl bg-slate-200/60 px-6 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

function FeedRow({ entry }: { entry: FeedEntry }) {
  const isSupplement = entry.severity === "required" || entry.severity === "recommended";

  return (
    <li className="flex items-center gap-3 rounded-xl bg-white px-5 py-4">
      {isSupplement && (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-slate-300" aria-hidden />
      )}
      <span
        className={
          "shrink-0 text-sm font-bold " +
          (isSupplement ? "text-danger" : "text-ink")
        }
      >
        {isSupplement ? SEVERITY_LABEL[entry.severity] : entry.label}
      </span>

      {isSupplement ? (
        entry.tag && (
          <span className="shrink-0 rounded bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-accent">
            {entry.tag}
          </span>
        )
      ) : (
        <span
          className={
            "shrink-0 rounded px-2 py-0.5 text-[11px] font-bold " +
            SEVERITY_CHIP[entry.severity]
          }
        >
          {SEVERITY_LABEL[entry.severity]}
        </span>
      )}

      <p className="min-w-0 flex-1 truncate text-sm text-slate-600">{entry.message}</p>

      {!isSupplement && entry.tag && (
        <span className="shrink-0 text-xs text-slate-500">{entry.tag}</span>
      )}
      {entry.at && (
        <span className="shrink-0 text-xs text-slate-400">{formatStamp(entry.at)}</span>
      )}
      {entry.href && (
        <Link
          href={entry.href}
          aria-label={`${entry.label} 수정하러 가기`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-dark"
        >
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </li>
  );
}

/** 제품 피드 / 부품 피드 */
export function EntryFeed({
  title,
  action,
  entries,
  emptyMessage,
  requiredNotice,
}: {
  title: string;
  action?: { label: string; href: string };
  entries: FeedEntry[];
  emptyMessage: string;
  /** draft 상태에서 상단에 붙는 붉은 필수 입력 안내 */
  requiredNotice?: boolean;
}) {
  const requiredCount = entries.filter((e) => e.severity !== "recommended").length;

  return (
    <section className="flex flex-col">
      <SectionHeader title={title} action={action} />

      {requiredNotice && requiredCount > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-danger">
          <span>{requiredCount}건의 필수 입력 사항이 있습니다.</span>
          <span>다음의 내용을 필수로 입력해야 진단을 원활하게 진행할 수 있습니다.</span>
        </div>
      )}

      {entries.length === 0 ? (
        <EmptyBox message={emptyMessage} />
      ) : (
        <ul className="mt-3 space-y-1.5 rounded-xl bg-white p-1.5 ring-1 ring-slate-100">
          {entries.map((e) => (
            <FeedRow key={e.id} entry={e} />
          ))}
        </ul>
      )}
    </section>
  );
}

/** 리포트 피드 — 진단 이벤트 로그 */
export function ReportFeed({
  entries,
  emptyMessage,
  onDismiss,
}: {
  entries: ReportFeedEntry[];
  emptyMessage: string;
  onDismiss: (id: string) => void;
}) {
  return (
    <section className="flex flex-col">
      <SectionHeader title="리포트 피드" />
      {entries.length === 0 ? (
        <EmptyBox message={emptyMessage} />
      ) : (
        <ul className="mt-3 space-y-1.5 rounded-xl bg-white p-1.5 ring-1 ring-slate-100">
          {entries.map((e) => (
            <li key={e.id} className="flex items-center gap-6 rounded-xl bg-white px-5 py-4">
              <span className="w-20 shrink-0 text-sm font-bold text-ink">{e.label}</span>
              <p className="min-w-0 flex-1 truncate text-sm text-slate-600">{e.message}</p>
              {e.removable ? (
                <button
                  type="button"
                  onClick={() => onDismiss(e.id)}
                  aria-label="알림 삭제"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-danger text-white hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : (
                <span className="shrink-0 text-xs text-slate-400">{formatStamp(e.at)}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ────────────────────────── 하단 전체 요약 ────────────────────────── */

export type OverviewRow = {
  id: string;
  /** 좌측 굵은 글씨 — 제품명 */
  product: string;
  message: string;
  at: string | null;
};

function formatDay(v: string | null) {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}

/**
 * 화면 하단 2열 — '보완해야 할 내용' · '최근 진행 로그' (시안).
 *
 * 위쪽 카드 목록이 선택된 제품 하나를 보여주는 것과 달리 여기는 **전 제품**을 모아 본다.
 * 그래서 행마다 어느 제품인지 제품명을 앞에 붙인다.
 */
export function OverviewList({
  title,
  count,
  rows,
  emptyMessage,
}: {
  title: string;
  /** 우측 상단 총 건수 — 없으면 표시하지 않는다 */
  count?: number;
  rows: OverviewRow[];
  emptyMessage: string;
}) {
  return (
    <section className="flex min-w-0 flex-col">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-ink">{title}</h2>
        {count != null && <span className="text-sm font-bold text-ink">{count}건</span>}
      </div>

      {rows.length === 0 ? (
        <EmptyBox message={emptyMessage} />
      ) : (
        <ul className="mt-3 max-h-72 space-y-1.5 overflow-y-auto pr-1">
          {rows.map((r) => (
            <li
              key={r.id}
              className="flex items-center gap-4 rounded-xl bg-white px-5 py-3.5 ring-1 ring-slate-100"
            >
              <span className="w-32 shrink-0 truncate text-sm font-bold text-ink">{r.product}</span>
              <p className="min-w-0 flex-1 truncate text-sm text-slate-600">{r.message}</p>
              <span className="shrink-0 text-xs text-slate-400">{formatDay(r.at)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
