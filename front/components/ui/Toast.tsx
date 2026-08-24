"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { cx } from "@/components/primitives";

/**
 * 시안의 Success / Danger Alert.
 * "성공적으로 등록했습니다." · "문제가 발생했습니다. 잠시 후 다시 시도해 주세요." 처럼
 * 작업 결과를 화면 아래에 잠깐 띄운다.
 */
export type ToastTone = "success" | "danger";
type Toast = { id: number; tone: ToastTone; message: string };

const ToastContext = createContext<{ show: (tone: ToastTone, message: string) => void } | null>(null);

/** 기본 실패 문구 — 시안과 동일하게 통일한다 */
export const GENERIC_ERROR = "문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((tone: ToastTone, message: string) => {
    setToasts((prev) => [...prev, { id: Date.now() + Math.random(), tone, message }]);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[70] flex w-full max-w-md -translate-x-1/2 flex-col gap-2 px-4">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDone={() => setToasts((p) => p.filter((x) => x.id !== t.id))} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDone }: { toast: Toast; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);

  const success = toast.tone === "success";
  const Icon = success ? CheckCircle2 : XCircle;
  return (
    <div
      role="status"
      className={cx(
        "pointer-events-auto flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg",
        success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-danger",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{toast.message}</span>
    </div>
  );
}

/**
 * Provider 없이 호출해도 앱이 죽지 않도록 no-op 으로 떨어뜨린다.
 * (부품 관리 밖 화면에서 컴포넌트를 재사용할 때를 위한 방어)
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  return (
    ctx ?? {
      show: () => {
        /* Provider 없음 — 무시 */
      },
    }
  );
}
