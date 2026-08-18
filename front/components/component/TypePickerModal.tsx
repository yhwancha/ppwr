"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Modal } from "@/components/ui/Dialog";
import { cx } from "@/components/primitives";
import {
  COMPONENT_TYPE_SPECS,
  TYPE_CATEGORIES,
  type TypeCategory,
} from "@/src/lib/ppwr-component-spec";

type Tab = TypeCategory | "전체";
const TABS: Tab[] = ["전체", ...TYPE_CATEGORIES];

/**
 * 부품 등록 1단계 — 포장재 유형 선택 모달.
 * 여기서 고른 유형이 등록 폼의 전용 입력 섹션과 첨부문서 체크리스트를 결정한다.
 */
export default function TypePickerModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  /** 다음 단계로 넘어갈 때 선택한 유형 키를 넘긴다 */
  onSelect: (typeKey: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("전체");
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<string | null>(null);

  const types = useMemo(() => {
    const term = q.trim().toLowerCase();
    return COMPONENT_TYPE_SPECS.filter((s) => {
      if (tab !== "전체" && s.category !== tab) return false;
      if (!term) return true;
      // 유형명뿐 아니라 세부 형태로도 찾을 수 있게 한다 ("스크류 캡" → 캡·뚜껑·마개)
      return (
        s.key.toLowerCase().includes(term) ||
        s.subTypes.some((t) => t.toLowerCase().includes(term))
      );
    });
  }, [tab, q]);

  function close() {
    setPicked(null);
    setQ("");
    setTab("전체");
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="포장재 유형을 선택해주세요"
      footer={
        <>
          <button
            type="button"
            onClick={close}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            취소
          </button>
          <button
            type="button"
            disabled={!picked}
            onClick={() => picked && onSelect(picked)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:bg-slate-100 disabled:text-slate-400"
          >
            다음 단계 <ArrowRight className="h-4 w-4" />
          </button>
        </>
      }
    >
      <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-3">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="포장재 유형 검색"
          className="w-full text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cx(
              "rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
              tab === t
                ? "bg-primary text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {types.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-400">
          검색 결과가 없습니다.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 p-5 sm:grid-cols-2">
          {types.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setPicked(s.key)}
              className={cx(
                "rounded-lg border px-4 py-3 text-left text-sm font-semibold transition-colors",
                picked === s.key
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-slate-200 bg-white text-ink hover:border-primary",
              )}
            >
              {s.key}
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}
