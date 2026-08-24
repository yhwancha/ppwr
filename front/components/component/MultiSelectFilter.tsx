"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { cx } from "@/components/primitives";

/**
 * 부품 관리 목록의 다중 선택 필터 (포장 단계 · 공급사 · 유형 · 연결된 제품).
 *
 * 시안(필터 오픈 시)대로 선택된 값은 패널 위쪽에 진한 칩으로 모이고 X 로 뺄 수 있으며,
 * 트리거에는 "n개 선택됨" 이 뜬다.
 */
export default function MultiSelectFilter({
  label,
  placeholder,
  options,
  selected,
  onChange,
}: {
  label: string;
  placeholder: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
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

  function toggle(value: string) {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  }

  const rest = options.filter((o) => !selected.includes(o));

  return (
    <div className="relative w-full sm:w-48" ref={ref}>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cx(
          "flex w-full items-center justify-between gap-2 rounded-lg border bg-white px-4 py-3 text-sm",
          selected.length ? "border-primary text-ink" : "border-slate-300 text-slate-400",
        )}
      >
        <span className="truncate">
          {selected.length ? `${selected.length}개 선택됨` : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          {options.length === 0 ? (
            <p className="px-4 py-4 text-sm text-slate-400">선택할 항목이 없습니다.</p>
          ) : (
            <div className="max-h-64 overflow-y-auto py-1">
              {selected.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => toggle(o)}
                  className="flex w-full items-center justify-between gap-2 bg-primary px-4 py-2.5 text-left text-sm font-semibold text-white"
                >
                  <span className="truncate">{o}</span>
                  <X className="h-4 w-4 shrink-0" />
                </button>
              ))}
              {rest.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => toggle(o)}
                  className="block w-full truncate px-4 py-2.5 text-left text-sm text-slate-500 hover:bg-slate-50"
                >
                  {o}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
