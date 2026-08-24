"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cx } from "@/components/primitives";

/** 모달 껍데기 — 배경 클릭·ESC 로 닫기, 본문 스크롤 잠금 */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = "max-w-2xl",
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        className={cx(
          "relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl",
          width,
        )}
      >
        {title != null && (
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-7 py-5">
            <h2 className="text-lg font-bold text-ink">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="-m-1 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-ink"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-7 py-6">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-7 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 확인 다이얼로그.
 * 시안 모달 3종을 한 컴포넌트로 커버한다:
 *   "정말 나가시겠습니까?" / "정말 선택한 항목을 삭제하시겠습니까?" /
 *   "이 부품은 진단이 확정된 제품에서 사용 중입니다."
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  tone = "primary",
  pending,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "primary" | "danger";
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/30" onClick={onCancel} aria-hidden />
      <div role="alertdialog" aria-modal="true" className="relative w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl">
        <h2 className="text-base font-bold text-ink">{title}</h2>
        {description && <div className="mt-3 text-sm leading-relaxed text-slate-500">{description}</div>}
        <div className="mt-7 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={cx(
              "rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60",
              tone === "danger" ? "bg-danger hover:bg-red-700" : "bg-primary hover:bg-primary-dark",
            )}
          >
            {pending ? "처리 중…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
