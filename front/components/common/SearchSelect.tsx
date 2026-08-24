"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cx } from "@/components/primitives";

export type SearchOption = { value: string; label: string };

/**
 * 검색형 단일 선택 (시안 "코드 검색 또는 선택").
 *
 * 목록이 길거나(HS Code) 목록에 없는 값도 받아야 하는 필드용이다.
 * `allowFreeInput` 이면 검색어를 그대로 값으로 확정할 수 있어, 후보에 없는 코드도 넣을 수 있다.
 */
export default function SearchSelect({
  value,
  onChange,
  options,
  placeholder,
  allowFreeInput,
  freeInputHint,
}: {
  value: string;
  onChange: (v: string) => void;
  options: SearchOption[];
  placeholder: string;
  allowFreeInput?: boolean;
  freeInputHint?: (q: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    function onDown(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const hits = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return options;
    return options.filter(
      (o) => o.value.toLowerCase().includes(needle) || o.label.toLowerCase().includes(needle),
    );
  }, [options, q]);

  const selected = options.find((o) => o.value === value);
  // 목록에 없는 값(직접 입력분)도 트리거에는 그대로 보여준다
  const shown = selected ? `${selected.value} · ${selected.label}` : value;

  function pick(v: string) {
    onChange(v);
    setQ("");
    setOpen(false);
  }

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cx(
          "flex w-full items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary",
          value ? "text-ink" : "text-slate-300",
        )}
      >
        <span className="truncate">{shown || placeholder}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              ref={searchRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                if (hits.length > 0) pick(hits[0].value);
                else if (allowFreeInput && q.trim()) pick(q.trim());
              }}
              placeholder="검색"
              className="w-full text-sm outline-none placeholder:text-slate-300"
            />
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            {value && (
              <button
                type="button"
                onClick={() => pick("")}
                className="block w-full px-4 py-2.5 text-left text-sm text-slate-400 hover:bg-slate-50"
              >
                선택 해제
              </button>
            )}
            {hits.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => pick(o.value)}
                className={cx(
                  "block w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50",
                  o.value === value ? "bg-primary-soft font-semibold text-primary" : "text-slate-600",
                )}
              >
                <span className="font-semibold">{o.value}</span>
                <span className="ml-2 text-slate-400">{o.label}</span>
              </button>
            ))}
            {hits.length === 0 &&
              (allowFreeInput && q.trim() ? (
                <button
                  type="button"
                  onClick={() => pick(q.trim())}
                  className="block w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50"
                >
                  {freeInputHint ? freeInputHint(q.trim()) : `"${q.trim()}" 직접 입력`}
                </button>
              ) : (
                <p className="px-4 py-4 text-sm text-slate-400">검색 결과가 없습니다.</p>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
