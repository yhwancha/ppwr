"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, FileText, Layers, Package, PencilLine, Trash2 } from "lucide-react";
import type { DiagnosisItem, DiagnosisStatus } from "@/src/lib/ppwr-diagnosis-service";

export const STATUS_META: Record<DiagnosisStatus, { label: string; chip: string }> = {
  draft: { label: "임시 저장", chip: "bg-slate-100 text-slate-500" },
  in_progress: { label: "진행 중", chip: "bg-amber-50 text-amber-600" },
  needs_supplement: { label: "보완 필요", chip: "bg-orange-50 text-orange-600" },
  confirmed: { label: "진단 확정", chip: "bg-emerald-50 text-emerald-700" },
};

function formatDate(v: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function formatDateTime(v: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return `${formatDate(v)} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** 카드 하단 — 상태별로 다른 요약(작성률 / 진행률 / 보완 건수 / 확정일) */
function CardFooter({ item }: { item: DiagnosisItem }) {
  if (item.status === "draft") {
    return (
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">작성률</span>
          <span className="font-bold text-ink">{item.progress}%</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100">
          <div className="h-1.5 rounded-full bg-slate-400" style={{ width: `${item.progress}%` }} />
        </div>
      </div>
    );
  }

  if (item.status === "in_progress") {
    return (
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">진단 진행률</span>
          <span className="font-bold text-ink">{item.progress}%</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100">
          <div className="h-1.5 rounded-full bg-amber-400" style={{ width: `${item.progress}%` }} />
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
          <span>예상 완료일시</span>
          <span>{formatDateTime(item.estimatedCompletionAt)}</span>
        </div>
      </div>
    );
  }

  if (item.status === "needs_supplement") {
    return (
      <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-3 text-xs">
        <AlertTriangle className="h-3.5 w-3.5 text-danger" />
        <span className="font-bold text-danger">{item.requiredSupplementCount}건 필수 보완</span>
        <span className="text-slate-400">{item.recommendedSupplementCount}건 권장 보완</span>
      </div>
    );
  }

  return (
    <div className="border-t border-slate-100 px-4 py-3 text-xs">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" /> 진단 확정
        </span>
        <span className="text-slate-400">{formatDate(item.confirmedAt)}</span>
      </div>
      {item.needsRediagnosis && (
        <p className="mt-2 inline-flex items-center gap-1.5 font-bold text-danger">
          <AlertTriangle className="h-3.5 w-3.5" /> 재진단 필요
        </p>
      )}
    </div>
  );
}

export default function DiagnosisCard({
  item,
  thumbUrl,
  selected,
  onSelect,
  onDelete,
}: {
  item: DiagnosisItem;
  /** 첫 제품 사진의 서명 URL. 없으면 아이콘 플레이스홀더를 쓴다. */
  thumbUrl?: string;
  selected: boolean;
  onSelect: () => void;
  /** hover 액션의 삭제 — 확인 모달은 목록 쪽에서 띄운다 */
  onDelete: () => void;
}) {
  const meta = STATUS_META[item.status];

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={
          "w-full rounded-xl bg-white text-left transition-colors " +
          (selected
            ? "border-2 border-ink"
            : "border border-slate-200 hover:border-slate-300")
        }
      >
        {/* 헤더: 썸네일 + 제품명 + 상태칩 */}
        <div className="flex items-start gap-3 p-4">
          {thumbUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element -- 서명 URL 은 만료되므로 next/image 최적화 대상이 아니다 */
            <img
              src={thumbUrl}
              alt=""
              className="h-14 w-14 shrink-0 rounded-lg bg-slate-100 object-cover"
            />
          ) : (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
              <Package className="h-6 w-6" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="truncate text-sm font-bold text-ink">{item.name}</p>
              {/* hover 시 이 자리를 삭제·편집 버튼이 덮는다 (시안) */}
              <span
                className={
                  "shrink-0 rounded px-2 py-0.5 text-[11px] font-bold transition-opacity group-hover:opacity-0 " +
                  meta.chip
                }
              >
                {meta.label}
              </span>
            </div>
            <p className="mt-1.5 flex items-center gap-2 text-xs text-slate-400">
              <span className="truncate">{item.sku ?? "SKU 미지정"}</span>
              <span className="text-slate-200">|</span>
              <span className="truncate">{item.category ?? "미분류"}</span>
            </p>
          </div>
        </div>

        {/* 메타: 부품 / 문서 / 누락항목 */}
        <div className="mx-4 flex items-center justify-between border-t border-slate-100 py-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-slate-300" /> 부품{" "}
            <b className="text-ink">{item.componentCount}개</b>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-slate-300" /> 문서{" "}
            <b className="text-ink">{item.documentCount}개</b>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-slate-300" /> 누락항목{" "}
            <b className="text-ink">{item.missingCount}개</b>
          </span>
        </div>

        <p className="px-4 pb-3 text-xs text-slate-400">{formatDate(item.updatedAt)} 수정</p>

        <CardFooter item={item} />
      </button>

      {/* hover 액션 — 카드 button 밖에 절대배치해야 버튼 중첩이 안 된다 */}
      <div className="pointer-events-none absolute right-4 top-4 flex gap-1.5 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1 rounded-lg bg-danger px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-red-700"
        >
          <Trash2 className="h-3.5 w-3.5" /> 삭제
        </button>
        <Link
          href={`/app/diagnosis/new?productId=${item.productId}`}
          className="inline-flex items-center gap-1 rounded-lg bg-ink px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-ink-soft"
        >
          <PencilLine className="h-3.5 w-3.5" /> 편집
        </Link>
      </div>

      {/* 확정 카드를 선택하면 리포트/재진단 액션이 붙는다 */}
      {selected && item.status === "confirmed" && (
        <div className="mt-2 flex gap-2">
          <Link
            href={item.reportId ? `/app/reports/${item.reportId}` : "/app/reports"}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-white hover:bg-ink-soft"
          >
            <FileText className="h-4 w-4" /> 리포트 보기
          </Link>
          <Link
            href={`/app/diagnosis/new?productId=${item.productId}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            재진단 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
