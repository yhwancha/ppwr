"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Download, Image as ImageIcon, Info, Upload, X } from "lucide-react";
import { cx } from "@/components/primitives";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { GENERIC_ERROR, useToast } from "@/components/ui/Toast";
import DocChecklist from "@/components/common/DocChecklist";
import { useEntityDocs, useEntityPhotos } from "@/components/common/use-entity-files";
import { getPpwrProductService } from "@/src/shared/api";
import { MULTI_SEP } from "@/src/lib/ppwr-component-attrs";
import {
  decodeProductAttrs,
  encodeProductAttrs,
  PK,
  productAttrList,
  productCompletion,
  type ProductAttrs,
} from "@/src/lib/ppwr-product-attrs";
import {
  CONTENT_FORMS,
  DIM_UNITS,
  EU_COUNTRIES,
  EU_MARKET_STATUS,
  MANUFACTURING_COUNTRIES,
  PRODUCT_CATEGORIES,
  PRODUCT_DOCS,
  STORAGE_CONDITIONS,
  WEIGHT_UNITS,
  YES_NO,
  csvTemplate,
} from "@/src/lib/ppwr-product-spec";
import type { PpwrProductRow } from "@/src/lib/ppwr-product-service";

/**
 * 제품 등록·수정 공용 폼.
 *
 * 시안 "제품 등록 페이지" 섹션 구성 그대로:
 *   기본 제품 정보 / 제조 및 규제 코드 / 제품 물성 정보 / 최종 포장 정보 /
 *   EU 시장 출시 계획 / 기타 / 첨부 문서   (+ 우측 CSV 일괄 등록 패널)
 *
 * 저장은 이 컴포넌트가 직접 한다. 등록 모드에서는 제품 row 가 없어 파일을 못 올리므로
 * 저장 → 대기 파일 업로드 → (사진 경로가 생겼으면) memo 재저장 순서로 이어붙인다.
 */
export default function ProductFormV2({
  mode,
  product,
  confirmBeforeSave,
  onSaved,
  onCancel,
  onOpenCsv,
}: {
  mode: "create" | "edit";
  product?: PpwrProductRow;
  /** 저장 직전 한 번 더 확인 (진단이 확정된 제품) */
  confirmBeforeSave?: { title: string; description: string } | null;
  onSaved: (productId: number) => void;
  onCancel: () => void;
  /** 등록 모드에서만 노출되는 CSV 업로드 진입 */
  onOpenCsv?: () => void;
}) {
  const qc = useQueryClient();
  const toast = useToast();
  const productId = product?.id ?? null;

  const [f, setF] = useState<Record<string, string>>(() => toState(product));
  const [attrs, setAttrs] = useState<ProductAttrs>(() => decodeProductAttrs(product?.memo));
  const [euCountries, setEuCountries] = useState<string[]>(() =>
    (product?.eu_launch_countries ?? "")
      .split(/[;,]/)
      .map((s) => s.trim())
      .filter(Boolean),
  );
  const [dirty, setDirty] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);

  const docs = useEntityDocs("product", productId, PRODUCT_DOCS);
  const photoPaths = useMemo(() => productAttrList(attrs, PK.photos), [attrs]);
  const photos = useEntityPhotos("product", productId, photoPaths, (next) =>
    setAttr(PK.photos, next.join(MULTI_SEP)),
  );

  const set = (k: string) => (v: string) => {
    setDirty(true);
    setF((s) => ({ ...s, [k]: v }));
  };
  function setAttr(key: string, value: string) {
    setDirty(true);
    setAttrs((prev) => ({ ...prev, [key]: value }));
  }
  const num = (v: string) => (v.trim() === "" ? null : Number(v));

  const completion = productCompletion({
    ...f,
    eu_launch_countries: euCountries.join(";"),
  });

  function buildPayload() {
    return {
      name: f.name.trim(),
      name_ko: f.name_ko.trim() || null,
      sku: f.sku.trim() || null,
      model_name: f.model_name.trim() || null,
      identifier_no: f.identifier_no.trim() || null,
      category: f.category || null,
      manufacturing_country: f.manufacturing_country || null,
      hs_code: f.hs_code.trim() || null,
      content_form: f.content_form || null,
      storage_condition: f.storage_condition || null,
      net_weight: num(f.net_weight),
      net_weight_unit: f.net_weight_unit,
      net_width: num(f.net_width),
      net_height: num(f.net_height),
      net_depth: num(f.net_depth),
      net_dim_unit: f.net_dim_unit,
      gross_weight: num(f.gross_weight),
      gross_weight_unit: f.gross_weight_unit,
      gross_width: num(f.gross_width),
      gross_height: num(f.gross_height),
      gross_depth: num(f.gross_depth),
      gross_dim_unit: f.gross_dim_unit,
      eu_market_status: f.eu_market_status || null,
      eu_launch_date: f.eu_launch_date || null,
      eu_launch_countries: euCountries.length ? euCountries.join(";") : null,
      eu_annual_volume: num(f.eu_annual_volume),
      eu_launch_note: f.eu_launch_note.trim() || null,
      contact_sensitive: f.contact_sensitive === "예",
      memo: encodeProductAttrs(attrs),
    };
  }

  async function persist() {
    setFormError(null);
    if (!f.name.trim()) return setFormError("제품명(영문)은 필수입니다.");
    if (!f.category) return setFormError("제품 카테고리는 필수입니다.");

    setSaving(true);
    const svc = getPpwrProductService();
    try {
      let id: number;
      if (mode === "create") {
        const created = await svc.create(buildPayload());
        id = created.id;
        await docs.flushPending(id);
        const finalPhotos = await photos.flushPending(id);
        if (finalPhotos.length !== photoPaths.length) {
          await svc.update(id, {
            memo: encodeProductAttrs({ ...attrs, [PK.photos]: finalPhotos.join(MULTI_SEP) }),
          });
        }
      } else {
        id = productId as number;
        await svc.update(id, buildPayload());
      }
      qc.invalidateQueries({ queryKey: ["ppwr", "products"] });
      qc.invalidateQueries({ queryKey: ["ppwr", "products", id] });
      toast.show("success", mode === "create" ? "성공적으로 등록했습니다." : "성공적으로 저장했습니다.");
      setDirty(false);
      onSaved(id);
    } catch (e) {
      const message = e instanceof Error ? e.message : GENERIC_ERROR;
      setFormError(message);
      toast.show("danger", message);
    } finally {
      setSaving(false);
    }
  }

  function requestSave() {
    if (confirmBeforeSave) setConfirmSaveOpen(true);
    else void persist();
  }
  function requestLeave() {
    if (dirty || docs.hasPending || photos.pending.length > 0) setLeaveOpen(true);
    else onCancel();
  }

  return (
    <form
      className="px-8 pb-24"
      onSubmit={(e) => {
        e.preventDefault();
        requestSave();
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={requestLeave}
            aria-label="뒤로"
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-ink"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-ink">
            {mode === "create" ? "제품 등록" : `${product?.name ?? "제품"} 수정`}
            <Info className="h-4 w-4 text-slate-300" />
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={requestLeave}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {saving ? "저장 중…" : "저장"}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatTile label="제품 카테고리" value={f.category || "—"} />
        <StatTile label="필수 입력 완료율" value={`${completion}%`} />
        <StatTile label="첨부 문서 확보율" value={`${docs.completion}%`} />
      </div>

      {(formError || docs.error || photos.error) && (
        <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-danger">
          {formError ?? docs.error ?? photos.error}
        </p>
      )}

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <Section title="기본 제품 정보" desc="제품을 고유하게 식별하는 기본 정보입니다.">
            <div className="mb-5">
              <Label>제품 사진</Label>
              <PhotoPicker
                paths={photoPaths}
                pending={photos.pending}
                busy={photos.busy}
                onAdd={(files) => {
                  setDirty(true);
                  void photos.add(files);
                }}
                onRemovePath={(p) => {
                  setDirty(true);
                  photos.removePath(p);
                }}
                onRemovePending={photos.removePending}
              />
            </div>
            <Grid>
              <TextField label="제품명 (영문)" required value={f.name} onChange={set("name")} placeholder="예: Aether Smartwatch Pro" />
              <TextField label="제품명 (국문)" value={f.name_ko} onChange={set("name_ko")} placeholder="예: 에테르 스마트워치 프로" />
              <TextField label="SKU" value={f.sku} onChange={set("sku")} placeholder="예: REV-DIR-001" />
              <TextField label="모델명" value={f.model_name} onChange={set("model_name")} placeholder="예: AW-PRO-2026" />
              <SelectField label="제품 카테고리" required value={f.category} onChange={set("category")} options={[...PRODUCT_CATEGORIES]} />
              <TextField label="식별번호" value={f.identifier_no} onChange={set("identifier_no")} placeholder="예: 8801234567890" />
            </Grid>
          </Section>

          <Section title="제조 및 규제 코드" desc="제조 원산지와 관세 분류 코드는 EU 통관 및 시장 감시 신고에 필요합니다.">
            <Grid>
              <SelectField label="제조 국가" value={f.manufacturing_country} onChange={set("manufacturing_country")} options={[...MANUFACTURING_COUNTRIES]} />
              <TextField label="HS Code" value={f.hs_code} onChange={set("hs_code")} placeholder="예: 9102.11" />
            </Grid>
          </Section>

          <Section
            title="제품 물성 정보"
            desc="제품 자체(포장 제외)의 형태, 보관 조건, 중량 및 치수입니다. 라벨링과 안전 규정 검토에 사용됩니다."
          >
            <Grid>
              <SelectField label="내용물 형태" value={f.content_form} onChange={set("content_form")} options={[...CONTENT_FORMS]} />
              <SelectField label="보관 조건" value={f.storage_condition} onChange={set("storage_condition")} options={[...STORAGE_CONDITIONS]} />
              <WeightField label="제품 Net 중량" value={f.net_weight} unit={f.net_weight_unit} onChange={set("net_weight")} onUnit={set("net_weight_unit")} />
              <div className="sm:col-span-2">
                <Label>제품 Net 치수</Label>
                <DimRow
                  w={f.net_width} h={f.net_height} d={f.net_depth} unit={f.net_dim_unit}
                  onW={set("net_width")} onH={set("net_height")} onD={set("net_depth")} onUnit={set("net_dim_unit")}
                />
              </div>
            </Grid>
          </Section>

          <Section
            title="최종 포장 정보"
            desc="고객에게 배송되는 최종 포장 단위 기준의 중량·치수입니다. PPWR 포장재 규정 및 물류 신고에 활용됩니다."
          >
            <Grid>
              <WeightField label="최종 포장 Gross 중량" value={f.gross_weight} unit={f.gross_weight_unit} onChange={set("gross_weight")} onUnit={set("gross_weight_unit")} />
              <div className="sm:col-span-2">
                <Label>최종 포장 Gross 치수</Label>
                <DimRow
                  w={f.gross_width} h={f.gross_height} d={f.gross_depth} unit={f.gross_dim_unit}
                  onW={set("gross_width")} onH={set("gross_height")} onD={set("gross_depth")} onUnit={set("gross_dim_unit")}
                />
              </div>
            </Grid>
          </Section>

          <Section
            title="EU 시장 출시 계획"
            desc="EU 시장 진출 계획입니다. 판매 예정국가와 예상 수량은 회원국별 규제 대응 우선순위를 정하는 데 사용됩니다."
          >
            <Grid>
              <SelectField label="EU 시장 출시 형태" value={f.eu_market_status} onChange={set("eu_market_status")} options={[...EU_MARKET_STATUS]} />
              <div>
                <Label>EU 출시 예정일</Label>
                <input type="date" value={f.eu_launch_date} onChange={(e) => set("eu_launch_date")(e.target.value)} className={inputCls} />
              </div>
              <NumberField label="EU 연간 예상 수량" unit="개" value={f.eu_annual_volume} onChange={set("eu_annual_volume")} />
              <TextField label="비고" value={f.eu_launch_note} onChange={set("eu_launch_note")} placeholder="특이사항" />
              <div className="sm:col-span-2">
                <Label>EU 판매 예정국가</Label>
                <div className="flex flex-wrap gap-1.5 rounded-lg border border-slate-300 p-2.5">
                  {EU_COUNTRIES.map((c) => {
                    const on = euCountries.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setDirty(true);
                          setEuCountries((prev) => (on ? prev.filter((x) => x !== c) : [...prev, c]));
                        }}
                        className={cx(
                          "rounded-md px-2.5 py-1 text-xs font-semibold",
                          on ? "bg-primary text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                        )}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Grid>
          </Section>

          <Section
            title="기타"
            desc="식품 접촉 및 신체 접촉 민감도 여부입니다. 해당 사항이 있을 경우 추가 소재 규정이 적용될 수 있습니다."
          >
            <Grid>
              <SelectField
                label="식품 접촉여부"
                value={attrs[PK.foodContact] ?? ""}
                onChange={(v) => setAttr(PK.foodContact, v)}
                options={[...YES_NO]}
              />
              <SelectField label="Contact-sensitive 여부" value={f.contact_sensitive} onChange={set("contact_sensitive")} options={[...YES_NO]} />
            </Grid>
          </Section>

          <Section title={`첨부 문서 (${PRODUCT_DOCS.length})`} desc="각 문서가 무엇을 확인하기 위한 것인지 함께 표시됩니다.">
            {mode === "create" && (
              <p className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                지금 고른 파일은 저장 버튼을 눌러 제품이 만들어진 뒤에 업로드됩니다.
              </p>
            )}
            <DocChecklist
              entries={docs.entries}
              onPick={(docName, files) => {
                setDirty(true);
                void docs.pick(docName, files);
              }}
              onRemove={(docName, file) => {
                setDirty(true);
                void docs.remove(docName, file);
              }}
              onDownload={(file) => void docs.download(file)}
              busyKey={docs.busyKey}
            />
          </Section>
        </div>

        {/* 우측: CSV 일괄 등록 (등록 모드에서만) */}
        {mode === "create" && (
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-bold text-ink">CSV로 업로드</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              CSV템플릿을 다운로드받고 여러 개의 제품 정보를 입력해서 한꺼번에 업로드할 수 있어요.
            </p>
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={downloadTemplate}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Download className="h-4 w-4" /> CSV 템플릿 다운로드
              </button>
              <button
                type="button"
                onClick={onOpenCsv}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                <Upload className="h-4 w-4" /> CSV 업로드
              </button>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
              템플릿 항목은 이 등록 폼 기준으로 만들었습니다. 확정 템플릿이 나오면 컬럼이 달라질 수 있습니다.
            </p>
          </aside>
        )}
      </div>

      <ConfirmDialog
        open={leaveOpen}
        title="정말 나가시겠습니까?"
        description="지금 나가면 편집중인 항목이 저장되지 않습니다."
        confirmLabel="나가기"
        onCancel={() => setLeaveOpen(false)}
        onConfirm={() => {
          setLeaveOpen(false);
          onCancel();
        }}
      />
      <ConfirmDialog
        open={confirmSaveOpen}
        title={confirmBeforeSave?.title ?? ""}
        description={confirmBeforeSave?.description}
        confirmLabel="수정"
        pending={saving}
        onCancel={() => setConfirmSaveOpen(false)}
        onConfirm={() => {
          setConfirmSaveOpen(false);
          void persist();
        }}
      />
    </form>
  );
}

/** 브라우저에서 CSV 템플릿을 내려받는다 (서버 왕복 없이 Blob) */
function downloadTemplate() {
  const blob = new Blob([csvTemplate()], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ppwr-제품등록-템플릿.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function toState(p?: PpwrProductRow): Record<string, string> {
  const g = (v: unknown) => (v == null ? "" : String(v));
  return {
    name: g(p?.name),
    name_ko: g(p?.name_ko),
    sku: g(p?.sku),
    model_name: g(p?.model_name),
    identifier_no: g(p?.identifier_no),
    category: g(p?.category),
    manufacturing_country: g(p?.manufacturing_country),
    hs_code: g(p?.hs_code),
    content_form: g(p?.content_form),
    storage_condition: g(p?.storage_condition),
    net_weight: g(p?.net_weight),
    net_weight_unit: g(p?.net_weight_unit) || WEIGHT_UNITS[0],
    net_width: g(p?.net_width),
    net_height: g(p?.net_height),
    net_depth: g(p?.net_depth),
    net_dim_unit: g(p?.net_dim_unit) || DIM_UNITS[0],
    gross_weight: g(p?.gross_weight),
    gross_weight_unit: g(p?.gross_weight_unit) || WEIGHT_UNITS[0],
    gross_width: g(p?.gross_width),
    gross_height: g(p?.gross_height),
    gross_depth: g(p?.gross_depth),
    gross_dim_unit: g(p?.gross_dim_unit) || DIM_UNITS[0],
    eu_market_status: g(p?.eu_market_status),
    eu_launch_date: g(p?.eu_launch_date),
    eu_annual_volume: g(p?.eu_annual_volume),
    eu_launch_note: g(p?.eu_launch_note),
    contact_sensitive: p?.contact_sensitive ? "예" : p ? "아니오" : "",
  };
}

/* ────────────────────────── 프리미티브 ────────────────────────── */

const inputCls =
  "w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none placeholder:text-slate-300 focus:border-primary";

function Section({ title, desc, children }: { title: string; desc: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-7">
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-slate-400">{desc}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}
function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
      <p className="text-xs font-semibold text-slate-400">{label}</p>
      <p className="mt-1 truncate text-xl font-extrabold text-ink">{value}</p>
    </div>
  );
}
function Grid({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}
function Label({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
      {children} {required && <span className="text-danger">*</span>}
    </label>
  );
}
function TextField({
  label, value, onChange, required, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />
    </div>
  );
}
function NumberField({
  label, value, onChange, unit,
}: { label: string; value: string; onChange: (v: string) => void; unit?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2">
        <input type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0" className={inputCls} />
        {unit && (
          <span className="flex items-center whitespace-nowrap rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-500">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
function SelectField({
  label, value, onChange, options, required,
}: { label: string; value: string; onChange: (v: string) => void; options: string[]; required?: boolean }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={cx(inputCls, "bg-white", !value && "text-slate-300")}>
        <option value="">선택</option>
        {options.map((o) => (
          <option key={o} value={o} className="text-slate-700">
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
function WeightField({
  label, value, unit, onChange, onUnit,
}: { label: string; value: string; unit: string; onChange: (v: string) => void; onUnit: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2">
        <input type="number" step="0.01" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0.00" className={inputCls} />
        <select value={unit} onChange={(e) => onUnit(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary">
          {WEIGHT_UNITS.map((u) => (
            <option key={u}>{u}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
function DimRow({
  w, h, d, unit, onW, onH, onD, onUnit,
}: {
  w: string; h: string; d: string; unit: string;
  onW: (v: string) => void; onH: (v: string) => void; onD: (v: string) => void; onUnit: (v: string) => void;
}) {
  const cell = "w-24 flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none placeholder:text-slate-300 focus:border-primary";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input type="number" step="0.01" value={w} onChange={(e) => onW(e.target.value)} placeholder="W" className={cell} />
      <span className="text-slate-400">x</span>
      <input type="number" step="0.01" value={h} onChange={(e) => onH(e.target.value)} placeholder="H" className={cell} />
      <span className="text-slate-400">x</span>
      <input type="number" step="0.01" value={d} onChange={(e) => onD(e.target.value)} placeholder="D" className={cell} />
      <select value={unit} onChange={(e) => onUnit(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-primary">
        {DIM_UNITS.map((u) => (
          <option key={u}>{u}</option>
        ))}
      </select>
    </div>
  );
}

function PhotoPicker({
  paths, pending, busy, onAdd, onRemovePath, onRemovePending,
}: {
  paths: string[]; pending: File[]; busy: boolean;
  onAdd: (files: File[]) => void; onRemovePath: (p: string) => void; onRemovePending: (i: number) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={() => ref.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
      >
        <Upload className="h-4 w-4 text-amber-500" /> {busy ? "업로드 중…" : "파일 첨부"}
      </button>
      <input
        ref={ref}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (files.length) onAdd(files);
        }}
      />
      <p className="mt-1 text-[10px] text-slate-400">최대 10개 / 개당 최대 100MB / jpg,png</p>
      {(paths.length > 0 || pending.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {paths.map((p) => (
            <Chip key={p} label={p.split("/").pop() ?? "사진"} onRemove={() => onRemovePath(p)} />
          ))}
          {pending.map((file, i) => (
            <Chip key={`p-${i}`} label={file.name} waiting onRemove={() => onRemovePending(i)} />
          ))}
        </div>
      )}
    </div>
  );
}
function Chip({ label, onRemove, waiting }: { label: string; onRemove: () => void; waiting?: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-400">
        <ImageIcon className="h-4 w-4" />
      </span>
      <span className="max-w-[140px] truncate text-xs font-semibold text-ink">{label}</span>
      {waiting && <span className="text-[10px] text-slate-400">대기</span>}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${label} 삭제`}
        className="rounded-full bg-ink/80 p-0.5 text-white hover:bg-ink"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
