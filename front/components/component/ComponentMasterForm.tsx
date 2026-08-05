"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Info, Trash2 } from "lucide-react";

const TYPES = ["뚜껑/캡", "용기/병", "라벨", "파우치", "단상자", "완충재", "박스", "기타"];
const DATA_STATUS: { v: string; l: string }[] = [
  { v: "provided", l: "자료 있음" },
  { v: "unknown", l: "모름" },
  { v: "need_check", l: "확인 필요" },
  { v: "not_available", l: "자료 없음" },
];

export type ComponentMasterFormValues = {
  name: string;
  type: string | null;
  material_summary: string | null;
  recycled_content: number | null;
  pfas_status: string;
  heavy_metal_status: string;
  compostability_status: string;
};

type S = Record<string, string>;
function toState(d?: Partial<Record<string, unknown>>): S {
  const g = (k: string, def = "") => (d && d[k] != null ? String(d[k]) : def);
  return {
    name: g("name"),
    type: g("type"),
    material_summary: g("material_summary"),
    recycled_content: g("recycled_content"),
    pfas_status: g("pfas_status", "unknown"),
    heavy_metal_status: g("heavy_metal_status", "unknown"),
    compostability_status: g("compostability_status", "unknown"),
  };
}

export default function ComponentMasterForm({
  title,
  subtitle,
  defaults,
  submitLabel = "저장하기",
  pending,
  error,
  readOnly,
  onSubmit,
  onDelete,
  deleting,
  cancelHref = "/app/components",
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  defaults?: Partial<Record<string, unknown>>;
  submitLabel?: string;
  pending?: boolean;
  error?: string | null;
  readOnly?: boolean;
  onSubmit: (v: ComponentMasterFormValues) => void;
  onDelete?: () => void;
  deleting?: boolean;
  cancelHref?: string;
  children?: ReactNode;
}) {
  const [f, setF] = useState<S>(() => toState(defaults));
  const [localErr, setLocalErr] = useState<string | null>(null);
  const set = (k: string) => (v: string) => setF((s) => ({ ...s, [k]: v }));
  const num = (v: string) => (v.trim() === "" ? null : Number(v));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setLocalErr(null);
    if (!f.name.trim()) return setLocalErr("부품명은 필수입니다.");
    onSubmit({
      name: f.name.trim(),
      type: f.type || null,
      material_summary: f.material_summary.trim() || null,
      recycled_content: num(f.recycled_content),
      pfas_status: f.pfas_status,
      heavy_metal_status: f.heavy_metal_status,
      compostability_status: f.compostability_status,
    });
  }
  const err = error ?? localErr;

  return (
    <form onSubmit={submit} className="px-8 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-ink">
            {title} <Info className="h-4 w-4 text-slate-300" />
          </h1>
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
        </div>
        {!readOnly && (
          <div className="flex gap-2">
            {onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-danger hover:bg-red-50 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" /> 부품 삭제
              </button>
            ) : (
              <Link href={cancelHref} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                취소
              </Link>
            )}
            <button type="submit" disabled={pending} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
              {pending ? "저장 중…" : submitLabel}
            </button>
          </div>
        )}
      </div>

      {readOnly && (
        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          리베이션 공용 부품은 조회만 가능합니다. 내 라이브러리에 등록한 부품만 수정할 수 있습니다.
        </p>
      )}
      {err && (
        <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-danger">{err}</p>
      )}

      <fieldset disabled={readOnly} className="mt-6 space-y-4">
        <Section title="부품 기본 정보" desc="부품을 식별하는 기본 정보입니다. 등록한 부품은 여러 제품에서 재사용됩니다.">
          <Grid>
            <Field label="부품명" required value={f.name} onChange={set("name")} placeholder="예: PP 스크류 캡" />
            <Select label="유형" value={f.type} onChange={set("type")} options={TYPES} />
            <Field label="재생원료 함량 (%)" type="number" value={f.recycled_content} onChange={set("recycled_content")} placeholder="0" />
            <Field label="소재 요약" value={f.material_summary} onChange={set("material_summary")} placeholder="예: PP 단일 소재" />
          </Grid>
        </Section>

        <Section title="유해물질·퇴비화 상태" desc="부품 단위 시험성적서 확보 여부입니다. PPWR 물질제한 요건 판단에 사용됩니다.">
          <Grid>
            <StatusSelect label="PFAS" value={f.pfas_status} onChange={set("pfas_status")} />
            <StatusSelect label="중금속" value={f.heavy_metal_status} onChange={set("heavy_metal_status")} />
            <StatusSelect label="퇴비화" value={f.compostability_status} onChange={set("compostability_status")} />
          </Grid>
        </Section>
      </fieldset>

      {children}
    </form>
  );
}

/* ---------- 프리미티브 (ProductForm 스타일 동일) ---------- */
function Section({ title, desc, children }: { title: string; desc: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-8 md:grid-cols-[300px_1fr]">
      <div>
        <h2 className="text-lg font-bold text-ink">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{desc}</p>
      </div>
      <div>{children}</div>
    </section>
  );
}
function Grid({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}
function Label({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-700">
      {children} {required && <span className="text-danger">*</span>}
    </label>
  );
}
const inputCls = "w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none placeholder:text-slate-300 focus:border-primary disabled:bg-slate-50 disabled:text-slate-400";
function Field({ label, value, onChange, required, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean; type?: string; placeholder?: string;
}) {
  return (
    <div><Label required={required}>{label}</Label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls} /></div>
  );
}
function Select({ label, value, onChange, options, required }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; required?: boolean;
}) {
  return (
    <div><Label required={required}>{label}</Label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls + " bg-white " + (value ? "" : "text-slate-300")}>
        <option value="">선택</option>
        {options.map((o) => <option key={o} value={o} className="text-slate-700">{o}</option>)}
      </select></div>
  );
}
function StatusSelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div><Label>{label}</Label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls + " bg-white"}>
        {DATA_STATUS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
      </select></div>
  );
}
