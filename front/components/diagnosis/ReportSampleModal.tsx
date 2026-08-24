"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Dialog";
import { cx } from "@/components/primitives";

/**
 * 리포트 샘플 모달 (진단 시작 헤더의 '리포트 샘플').
 *
 * ⚠️ 시안 자체가 내용 미정이다 — 설명 자리에 "…에 대한 설명이 올 예정입니다.",
 *    이미지 자리에 "…에 대한 이미지입니다." 라고만 적혀 있다. 실제 문구·샘플 이미지가
 *    나오면 SAMPLES 의 description 과 이미지 자리만 채우면 된다.
 */
const SAMPLES = [
  { key: "summary", label: "간단 리포트" },
  { key: "td", label: "TD 리포트" },
  { key: "doc", label: "DoC 리포트" },
] as const;

type SampleKey = (typeof SAMPLES)[number]["key"];

export default function ReportSampleModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<SampleKey>("summary");
  const current = SAMPLES.find((s) => s.key === tab) ?? SAMPLES[0];

  return (
    <Modal open={open} onClose={onClose} title="리포트 샘플" width="max-w-3xl">
      <div className="flex overflow-hidden rounded-lg border border-slate-200">
        {SAMPLES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setTab(s.key)}
            aria-pressed={tab === s.key}
            className={cx(
              "flex-1 py-3 text-sm font-semibold transition-colors",
              tab === s.key ? "bg-primary text-white" : "bg-white text-slate-500 hover:bg-slate-50",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm text-slate-500">{current.label}에 대한 설명이 올 예정입니다.</p>

      <div className="mt-3 max-h-[55vh] space-y-3 overflow-y-auto pr-1">
        <div className="flex min-h-[420px] items-center justify-center rounded-lg bg-slate-200/60 px-6 text-center text-sm text-slate-500">
          {current.label}에 대한 이미지입니다.
        </div>
        <div className="h-24 rounded-lg bg-slate-200/60" aria-hidden />
      </div>
    </Modal>
  );
}
