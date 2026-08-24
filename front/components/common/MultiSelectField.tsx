"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cx } from "@/components/primitives";

/**
 * 폼 안에서 쓰는 드롭다운형 다중 선택 (시안 "EU 판매 예정국가").
 *
 * 시안에는 닫힌 상태만 그려져 있어 단일 선택처럼 보이지만, EU 판매국은 여러 나라를
 * 고를 수 있어야 하고(목록 카드의 "EU n개국") 저장 컬럼도 다중 값이라 다중 선택으로 둔다.
 *
 * 목록 필터용 MultiSelectFilter 와 달리 자체 라벨·고정 폭이 없어 폼 그리드에 그대로 들어간다.
 */
export default function MultiSelectField({
  values,
  onChange,
  options,
  placeholder,
  summary,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  options: readonly string[];
  placeholder: string;
  /** 트리거에 표시할 요약 문구. 없으면 "n개 선택됨" */
  summary?: (values: string[]) => string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function toggle(v: string) {
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cx(
          "flex w-full items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary",
          values.length ? "text-ink" : "text-slate-300",
        )}
      >
        <span className="truncate">
          {values.length
            ? summary
              ? summary(values)
              : `${values.length}개 선택됨`
            : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {values.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-md bg-primary-soft px-2 py-1 text-xs font-semibold text-primary"
            >
              {v}
              <button
                type="button"
                onClick={() => toggle(v)}
                aria-label={`${v} 제외`}
                className="text-primary/60 hover:text-primary"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="max-h-64 overflow-y-auto py-1">
            {options.map((o) => {
              const on = values.includes(o);
              return (
                <button
                  key={o}
                  type="button"
                  onClick={() => toggle(o)}
                  className={cx(
                    "flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm hover:bg-slate-50",
                    on ? "font-semibold text-primary" : "text-slate-600",
                  )}
                >
                  <span className="truncate">{o}</span>
                  {on && <Check className="h-4 w-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
