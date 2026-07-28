"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, Info, Trash2 } from "lucide-react";

const categories = ["화장품 / 뷰티", "식품", "생활소비재", "의류", "전자제품", "기타"];
const countries = ["South Korea", "China", "Vietnam", "Japan", "USA", "기타"];
const contentForms = ["액상", "고체", "분말", "냉동식품", "기타"];
const storageConds = ["상온", "냉장", "냉동", "기타"];

export type ProductFormValues = {
  name: string; sku: string | null; model_name: string | null; identifier_no: string | null;
  category: string | null; manufacturing_country: string | null; hs_code: string | null;
  content_form: string | null; storage_condition: string | null;
  net_weight: number | null; net_weight_unit: string;
  net_width: number | null; net_height: number | null; net_depth: number | null; net_dim_unit: string;
  gross_weight: number | null; gross_weight_unit: string;
  gross_width: number | null; gross_height: number | null; gross_depth: number | null; gross_dim_unit: string;
  eu_launch_countries: string | null; eu_launch_date: string | null;
  eu_annual_volume: number | null; eu_launch_note: string | null;
};

type State = Record<string, string>;

function toState(d?: Partial<Record<string, unknown>>): State {
  const g = (k: string) => (d && d[k] != null ? String(d[k]) : "");
  return {
    name: g("name"), sku: g("sku"), model_name: g("model_name"), identifier_no: g("identifier_no"),
    category: g("category"), manufacturing_country: g("manufacturing_country"), hs_code: g("hs_code"),
    content_form: g("content_form"), storage_condition: g("storage_condition"),
    net_weight: g("net_weight"), net_weight_unit: g("net_weight_unit") || "g",
    net_width: g("net_width"), net_height: g("net_height"), net_depth: g("net_depth"), net_dim_unit: g("net_dim_unit") || "mm",
    gross_weight: g("gross_weight"), gross_weight_unit: g("gross_weight_unit") || "g",
    gross_width: g("gross_width"), gross_height: g("gross_height"), gross_depth: g("gross_depth"), gross_dim_unit: g("gross_dim_unit") || "mm",
    eu_launch_countries: g("eu_launch_countries"), eu_launch_date: g("eu_launch_date"),
    eu_annual_volume: g("eu_annual_volume"), eu_launch_note: g("eu_launch_note"),
  };
}

export default function ProductForm({
  title, subtitle, defaults, submitLabel = "저장하기", pending, error,
  onSubmit, cancelHref = "/app/products", onDelete, deleting,
}: {
  title: string;
  subtitle?: ReactNode;
  defaults?: Partial<Record<string, unknown>>;
  submitLabel?: string;
  pending?: boolean;
  error?: string | null;
  onSubmit: (v: ProductFormValues) => void;
  cancelHref?: string;
  onDelete?: () => void;
  deleting?: boolean;
}) {
  const [f, setF] = useState<State>(() => toState(defaults));
  const [localErr, setLocalErr] = useState<string | null>(null);
  const set = (k: string) => (v: string) => setF((s) => ({ ...s, [k]: v }));
  const num = (v: string) => (v.trim() === "" ? null : Number(v));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setLocalErr(null);
    if (!f.name.trim()) return setLocalErr("제품명(영문)은 필수입니다.");
    if (!f.category) return setLocalErr("제품 카테고리는 필수입니다.");
    onSubmit({
      name: f.name.trim(), sku: f.sku.trim() || null, model_name: f.model_name.trim() || null,
      identifier_no: f.identifier_no.trim() || null, category: f.category || null,
      manufacturing_country: f.manufacturing_country || null, hs_code: f.hs_code.trim() || null,
      content_form: f.content_form || null, storage_condition: f.storage_condition || null,
      net_weight: num(f.net_weight), net_weight_unit: f.net_weight_unit,
      net_width: num(f.net_width), net_height: num(f.net_height), net_depth: num(f.net_depth), net_dim_unit: f.net_dim_unit,
      gross_weight: num(f.gross_weight), gross_weight_unit: f.gross_weight_unit,
      gross_width: num(f.gross_width), gross_height: num(f.gross_height), gross_depth: num(f.gross_depth), gross_dim_unit: f.gross_dim_unit,
      eu_launch_countries: f.eu_launch_countries.trim() || null,
      eu_launch_date: f.eu_launch_date || null,
      eu_annual_volume: f.eu_annual_volume ? Number(f.eu_annual_volume) : null,
      eu_launch_note: f.eu_launch_note.trim() || null,
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
        <div className="flex gap-2">
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-danger hover:bg-red-50 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" /> 제품 삭제
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
      </div>

      {err && (
        <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-danger">{err}</p>
      )}

      <div className="mt-6 space-y-4">
        <Section title="기본 제품 정보" desc="제품을 고유하게 식별하는 기본 정보입니다.">
          <Grid>
            <Field label="제품명 (영문)" required value={f.name} onChange={set("name")} placeholder="예: Daily Radiance Serum" />
            <Field label="SKU" value={f.sku} onChange={set("sku")} placeholder="예: SER-50-01" />
            <Field label="모델명" hint value={f.model_name} onChange={set("model_name")} placeholder="예: SER-50" />
            <Field label="식별번호" hint value={f.identifier_no} onChange={set("identifier_no")} placeholder="예: 5020305920" />
            <Select label="제품 카테고리" required value={f.category} onChange={set("category")} options={categories} />
          </Grid>
        </Section>

        <Section title="제조 및 규제 코드" desc="제조 원산지와 관세 분류 코드는 EU 통관 및 시장 감시 신고에 필요합니다.">
          <Grid>
            <Select label="제조 국가" value={f.manufacturing_country} onChange={set("manufacturing_country")} options={countries} />
            <Field label="HS Code" hint value={f.hs_code} onChange={set("hs_code")} placeholder="코드 검색 또는 선택" />
          </Grid>
        </Section>

        <Section title="제품 물성 정보" desc="제품 자체(포장 제외)의 형태, 보관 조건, 중량 및 치수입니다. 라벨링과 안전 규정 검토에 사용됩니다.">
          <Grid>
            <Select label="내용물 형태" value={f.content_form} onChange={set("content_form")} options={contentForms} />
            <Select label="보관 조건" value={f.storage_condition} onChange={set("storage_condition")} options={storageConds} />
            <WeightField label="제품 Net 중량" value={f.net_weight} onChange={set("net_weight")} unit={f.net_weight_unit} onUnit={set("net_weight_unit")} />
            <DimField label="제품 Net 치수" w={f.net_width} h={f.net_height} d={f.net_depth} unit={f.net_dim_unit} onW={set("net_width")} onH={set("net_height")} onD={set("net_depth")} onUnit={set("net_dim_unit")} />
          </Grid>
        </Section>

        <Section title="최종 포장 정보" desc="고객에게 배송되는 최종 포장 단위 기준의 중량·치수입니다. PPWR 포장재 규정 및 물류 신고에 활용됩니다.">
          <Grid>
            <WeightField label="최종 포장 Gross 중량" value={f.gross_weight} onChange={set("gross_weight")} unit={f.gross_weight_unit} onUnit={set("gross_weight_unit")} />
            <DimField label="최종 포장 Gross 치수" w={f.gross_width} h={f.gross_height} d={f.gross_depth} unit={f.gross_dim_unit} onW={set("gross_width")} onH={set("gross_height")} onD={set("gross_depth")} onUnit={set("gross_dim_unit")} />
          </Grid>
        </Section>

        <Section title="EU 시장 출시 계획" desc="EU 시장 진입 관련 정보입니다.">
          <Grid>
            <Field label="EU 출시 국가" value={f.eu_launch_countries} onChange={set("eu_launch_countries")} placeholder="예: Germany, France" />
            <Field label="EU 출시 예정일" type="date" value={f.eu_launch_date} onChange={set("eu_launch_date")} />
            <Field label="연간 EU 출시 예상 수량 (개)" type="number" value={f.eu_annual_volume} onChange={set("eu_annual_volume")} placeholder="예: 50000" />
            <Field label="기타" value={f.eu_launch_note} onChange={set("eu_launch_note")} placeholder="특이사항" />
          </Grid>
        </Section>
      </div>
    </form>
  );
}

/* ---------- 프리미티브 ---------- */
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
function Label({ children, required, hint }: { children: ReactNode; required?: boolean; hint?: boolean }) {
  return (
    <label className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-700">
      {children} {required && <span className="text-danger">*</span>}
      {hint && <Info className="h-3.5 w-3.5 text-slate-300" />}
    </label>
  );
}
const inputCls = "w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none placeholder:text-slate-300 focus:border-primary";
function Field({ label, value, onChange, required, hint, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean; hint?: boolean; type?: string; placeholder?: string;
}) {
  return (
    <div><Label required={required} hint={hint}>{label}</Label>
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
/** 단위 드롭다운 — 네이티브 화살표 숨기고 커스텀 chevron, 내용에 맞는 폭 */
function UnitSelect({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-[68px] cursor-pointer appearance-none rounded-lg border border-slate-300 bg-white py-3 pl-3 pr-7 text-sm text-slate-600 outline-none focus:border-primary"
      >
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}
function WeightField({ label, value, onChange, unit, onUnit }: {
  label: string; value: string; onChange: (v: string) => void; unit: string; onUnit: (v: string) => void;
}) {
  return (
    <div><Label>{label}</Label>
      <div className="flex gap-2">
        <input type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0.00" className={inputCls} />
        <UnitSelect value={unit} onChange={onUnit} options={["g", "kg"]} />
      </div></div>
  );
}
function DimField({ label, w, h, d, unit, onW, onH, onD, onUnit }: {
  label: string; w: string; h: string; d: string; unit: string;
  onW: (v: string) => void; onH: (v: string) => void; onD: (v: string) => void; onUnit: (v: string) => void;
}) {
  const box = "w-full rounded-lg border border-slate-300 px-2 py-3 text-center text-sm outline-none placeholder:text-slate-300 focus:border-primary";
  return (
    <div><Label>{label}</Label>
      <div className="flex items-center gap-1.5">
        <input value={w} onChange={(e) => onW(e.target.value)} placeholder="W" className={box} />
        <span className="text-slate-300">×</span>
        <input value={h} onChange={(e) => onH(e.target.value)} placeholder="H" className={box} />
        <span className="text-slate-300">×</span>
        <input value={d} onChange={(e) => onD(e.target.value)} placeholder="D" className={box} />
        <UnitSelect value={unit} onChange={onUnit} options={["mm", "cm"]} />
      </div></div>
  );
}
