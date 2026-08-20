"use client";

import { StepCard } from "./parts";

const NOTICES = [
  "고객의 부주의로 발생한 오타, 누락된 서류 등으로 인해 정확하지 않은 진단 결과의 책임은 본인에게 있습니다.",
  "진단을 실행한 다음 제품 및 부품 정보 수정 후 재진단 시 비용이 발생할 수 있습니다.",
  "유의 사항에 대한 내용입니다.",
  "유의 사항에 대한 내용입니다.",
  "유의 사항에 대한 내용입니다.",
];

export default function StepRun({
  agreed,
  onAgree,
}: {
  agreed: boolean;
  onAgree: (v: boolean) => void;
}) {
  return (
    <StepCard step={3} title="진단 진행" description="유의 사항을 확인 후 진단을 진행합니다.">
      <h3 className="border-b border-slate-100 pb-3 text-sm font-bold text-ink">유의사항</h3>

      <ol className="mt-2">
        {NOTICES.map((n, i) => (
          <li key={i} className="flex gap-2 py-3.5 text-sm font-semibold text-ink">
            <span className="shrink-0 text-slate-400">{i + 1}.</span>
            {n}
          </li>
        ))}
      </ol>

      <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-lg bg-slate-100 px-5 py-4 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onAgree(e.target.checked)}
          className="h-4 w-4 shrink-0 rounded border-slate-300 accent-primary"
        />
        위 내용을 모두 숙지하였으며, 동의합니다.
      </label>
    </StepCard>
  );
}
