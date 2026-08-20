"use client";

import type { ReactNode } from "react";
import { Send } from "lucide-react";

export const WIZARD_STEPS = [
  { n: 1, label: "제조자 / 기업 식별" },
  { n: 2, label: "제품 정보 입력" },
  { n: 3, label: "진단 진행" },
] as const;

export type StepNo = 1 | 2 | 3;

/** 상단 3단계 스테퍼 — 현재 단계만 짙게 채운다 */
export function Stepper({
  current,
  onJump,
}: {
  current: StepNo;
  onJump: (n: StepNo) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {WIZARD_STEPS.map((s) => {
        const active = s.n === current;
        return (
          <button
            key={s.n}
            type="button"
            onClick={() => onJump(s.n as StepNo)}
            aria-current={active ? "step" : undefined}
            className={
              "inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-bold transition-colors " +
              (active ? "bg-ink text-white" : "bg-slate-200/70 text-slate-500 hover:bg-slate-200")
            }
          >
            <span
              className={
                "flex h-5 w-5 items-center justify-center rounded-full text-[11px] " +
                (active ? "bg-white text-ink" : "bg-slate-400 text-white")
              }
            >
              {s.n}
            </span>
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

/** 각 단계 본문을 감싸는 흰 카드 + 번호 달린 제목 */
export function StepCard({
  step,
  title,
  description,
  children,
}: {
  step: StepNo;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-7">
      <header className="flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-white">
          {step}
        </span>
        <div>
          <h2 className="text-base font-bold text-ink">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </div>
      </header>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function FieldGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-7 first:mt-0">
      <h3 className="text-sm font-bold text-ink">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function Field({
  label,
  required,
  hint,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  required?: boolean;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
      />
      {hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

/** 회색 배경 위 체크박스 한 줄 */
export function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-slate-100 px-5 py-4 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 shrink-0 rounded border-slate-300 accent-primary"
      />
      {label}
    </label>
  );
}

/** 필수 입력 경고 배너 (시안: 붉은 경고 + 우측 '내용 확인' 버튼) */
export function RequiredBanner({ count, onConfirm }: { count: number; onConfirm?: () => void }) {
  if (count <= 0) return null;
  return (
    <div className="mb-3 flex items-center gap-3 text-xs">
      <span className="font-bold text-danger">⚠ 필수 입력 내용 {count}건</span>
      <span className="text-slate-400">
        다음의 내용을 필수로 입력해야 진단을 원활하게 진행할 수 있습니다.
      </span>
      {onConfirm && (
        <button
          type="button"
          onClick={onConfirm}
          className="ml-auto rounded-lg bg-danger px-3.5 py-2 text-xs font-bold text-white hover:bg-red-700"
        >
          내용 확인
        </button>
      )}
    </div>
  );
}

/** 우측 AI 입력 도우미 패널 (1·2단계) */
export function AiAssistant() {
  return (
    <aside className="flex h-fit flex-col rounded-2xl bg-slate-100 p-5">
      <h2 className="text-sm font-bold text-ink">AI 내용 입력 도우미</h2>

      <div className="mt-4 min-h-[320px] flex-1 space-y-3">
        <p className="w-fit rounded-lg bg-white px-4 py-2.5 text-sm text-slate-600">
          챗봇에 의해 입력된 내용입니다.
        </p>
        <p className="ml-auto w-fit rounded-lg bg-ink px-4 py-2.5 text-sm text-white">
          사용자에 의해 입력된 내용입니다.
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex flex-wrap gap-2">
          {["예시 내용 채우기", "사진으로 내용 입력", "내용 모두 지우기"].map((b) => (
            <button
              key={b}
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              {b}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-400">
          왼쪽 제품정보를 입력 도우미와 함께 채워넣을 수 있어요.
        </p>
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            aria-label="보내기"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-dark"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
