"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { Download, FileText, Send, Upload, X } from "lucide-react";

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

/**
 * 체크박스 한 줄 + 켰을 때 아래로 펼쳐지는 하위 입력 섹션 (시안 "옵션 체크 시").
 *
 * 체크가 꺼져 있으면 children 을 아예 렌더하지 않는다 — 값이 남아 있어도 화면에서 사라지고,
 * 저장 시점에 체크 여부로 포함/제외를 판단하면 되므로 입력값을 굳이 지우지 않는다.
 */
export function CheckSection({
  label,
  checked,
  onChange,
  title,
  children,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg bg-slate-100">
      <label className="flex cursor-pointer items-center gap-3 px-5 py-4 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 shrink-0 rounded border-slate-300 accent-primary"
        />
        {label}
      </label>
      {checked && (
        <div className="px-5 pb-5">
          <h4 className="text-sm font-bold text-ink">{title}</h4>
          <div className="mt-4">{children}</div>
        </div>
      )}
    </div>
  );
}

/** 본사 주소 (영문) — Building Number·Street / City·Country·Postal Code */
export function AddressEnFields({
  value,
  onChange,
  required,
}: {
  value: { buildingNumber: string; street: string; city: string; country: string; postalCode: string };
  onChange: (patch: Partial<typeof value>) => void;
  required?: boolean;
}) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold text-slate-700">
        본사 주소 (영문) {required && <span className="text-danger">*</span>}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Building Number"
          required={required}
          value={value.buildingNumber}
          onChange={(v) => onChange({ buildingNumber: v })}
        />
        <Field label="Street" required={required} value={value.street} onChange={(v) => onChange({ street: v })} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <Field label="City" required={required} value={value.city} onChange={(v) => onChange({ city: v })} />
        <Field label="Country" required={required} value={value.country} onChange={(v) => onChange({ country: v })} />
        <Field
          label="Postal Code"
          required={required}
          value={value.postalCode}
          onChange={(v) => onChange({ postalCode: v })}
        />
      </div>
    </div>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "선택",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={
          "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary " +
          (value ? "text-ink" : "text-slate-300")
        }
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o} className="text-ink">
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

export function TextareaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      <textarea
        rows={3}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none placeholder:text-slate-300 focus:border-primary"
      />
    </div>
  );
}

/**
 * 파일 첨부 한 칸 (시안 "위임 문서").
 *
 * ⚠️ 1단계는 아직 붙일 엔티티(진단 row)가 없어 업로드를 미룬다. 고른 파일은 메모리에만
 *    들고 있고 칩으로 보여준다. 저장 경로가 생기면 여기서 올리면 된다.
 */
export function FilePickField({
  label,
  files,
  onAdd,
  onRemove,
}: {
  label: string;
  files: File[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        <Upload className="h-4 w-4" /> 파일 첨부
      </button>
      <input
        ref={ref}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.pdf,.csv"
        className="hidden"
        onChange={(e) => {
          const picked = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (picked.length) onAdd(picked.slice(0, 10 - files.length));
        }}
      />
      <p className="mt-1 text-[10px] text-slate-400">최대 10개 / 개당 최대 100MB / jpg,png,pdf,csv</p>
      {files.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {files.map((f, i) => (
            <div key={`${f.name}-${i}`} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-400">
                <FileText className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="max-w-[120px] truncate text-xs font-semibold text-ink">{f.name}</p>
                <span className="text-[11px] text-slate-400">{Math.round(f.size / 1024)}kb</span>
              </div>
              <Download className="h-3.5 w-3.5 shrink-0 text-slate-300" aria-hidden />
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label={`${f.name} 삭제`}
                className="rounded-full bg-ink/80 p-0.5 text-white hover:bg-ink"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
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
