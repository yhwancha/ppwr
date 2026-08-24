"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Image as ImageIcon, Info, Upload, X } from "lucide-react";
import { cx } from "@/components/primitives";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { GENERIC_ERROR, useToast } from "@/components/ui/Toast";
import DocChecklist from "@/components/common/DocChecklist";
import MultiSelectField from "@/components/common/MultiSelectField";
import SearchSelect from "@/components/common/SearchSelect";
import { useEntityDocs, useEntityPhotos } from "@/components/common/use-entity-files";
import AiFillPanel, { type AiFillAction } from "@/components/product/AiFillPanel";
import { getPpwrProductService } from "@/src/shared/api";
import { MULTI_SEP } from "@/src/lib/ppwr-component-attrs";
import {
  decodeProductAttrs,
  encodeProductAttrs,
  PK,
  productAttrList,
  type ProductAttrs,
} from "@/src/lib/ppwr-product-attrs";
import {
  CONTENT_FORMS,
  DIM_UNITS,
  EU_COUNTRIES,
  EU_MARKET_STATUS,
  EXAMPLE_EU_COUNTRIES,
  EXAMPLE_PRODUCT,
  HS_CODES,
  MANUFACTURING_COUNTRIES,
  PRODUCT_CATEGORIES,
  PRODUCT_DOCS,
  STORAGE_CONDITIONS,
  VOLUME_UNITS,
  WEIGHT_UNITS,
} from "@/src/lib/ppwr-product-spec";
import type { PpwrProductRow } from "@/src/lib/ppwr-product-service";

/**
 * 제품 등록·수정 공용 폼.
 *
 * 시안 "제품 등록 페이지" 구성 그대로:
 *   좌측 — 기본 제품 정보 / 제조 및 규제 코드 / 제품 물성 정보 / 최종 포장 정보 /
 *          EU 시장 출시 계획 / 기타 / 첨부 문서
 *   우측 — XLS로 업로드 · AI 내용 입력 도우미  (등록 모드에서만)
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
  chrome = "full",
  footer,
  onDirtyChange,
  formId,
}: {
  mode: "create" | "edit";
  product?: PpwrProductRow;
  /** 저장 직전 한 번 더 확인 (진단이 확정된 제품) */
  confirmBeforeSave?: { title: string; description: string } | null;
  onSaved: (productId: number) => void;
  onCancel: () => void;
  /** 등록 모드에서만 노출되는 일괄 업로드 진입 */
  onOpenCsv?: () => void;
  /**
   * full     — 자체 헤더(제목·취소·저장)를 그린다. 제품 관리에서 쓰는 기본값
   * embedded — 헤더 없이 본문만. 진단 시작의 '새 제품 등록'처럼 페이지가 자기 헤더를
   *            갖는 경우에 쓴다. 저장은 footer 의 submit 버튼이 담당한다.
   */
  chrome?: "full" | "embedded";
  /** 본문 아래에 붙는 조작부. form 안이라 type="submit" 버튼이 곧 저장이다 */
  footer?: ReactNode;
  /** 상위가 '저장 안 함' 경고를 띄울 수 있도록 변경 여부를 알린다 */
  onDirtyChange?: (dirty: boolean) => void;
  /** 폼 밖 버튼에서 submit 을 일으키기 위한 id */
  formId?: string;
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

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

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

  /** AI 도우미의 두 동작 — 백엔드 없이 도는 것만 여기서 처리한다 */
  function handleAiAction(action: AiFillAction): string {
    setDirty(true);
    if (action === "example") {
      setF((s) => ({ ...s, ...EXAMPLE_PRODUCT }));
      setEuCountries([...EXAMPLE_EU_COUNTRIES]);
      setAttrs((prev) => ({ ...prev, [PK.foodContact]: "아니오" }));
      return "예시 제품(Daily Radiance Serum) 정보를 채웠습니다. 실제 값으로 바꿔 주세요.";
    }
    setF(toState(undefined));
    setEuCountries([]);
    // 사진은 이미 올라간 파일이라 지우지 않는다 (사진 영역에서 개별 삭제)
    setAttrs((prev) => ({ [PK.photos]: prev[PK.photos] ?? "" }));
    return "입력한 내용을 모두 지웠습니다. 첨부한 사진과 문서는 그대로 두었습니다.";
  }

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
      id={formId}
      className={chrome === "full" ? "px-8 pb-24" : ""}
      onSubmit={(e) => {
        e.preventDefault();
        requestSave();
      }}
    >
      {chrome === "full" && (
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
      )}

      {(formError || docs.error || photos.error) && (
        <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-danger">
          {formError ?? docs.error ?? photos.error}
        </p>
      )}

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_360px]">
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
              <TextField label="제품명 (영문)" required value={f.name} onChange={set("name")} placeholder="예: Daily Radiance Serum" />
              <TextField label="제품명 (국문)" value={f.name_ko} onChange={set("name_ko")} placeholder="예: 세럼" />
              <TextField label="SKU" value={f.sku} onChange={set("sku")} placeholder="예: SER-50-01" />
              <TextField label="모델명" info value={f.model_name} onChange={set("model_name")} placeholder="예: SER-50" />
              <SelectField label="제품 카테고리" required value={f.category} onChange={set("category")} options={[...PRODUCT_CATEGORIES]} />
              <TextField label="식별번호" info value={f.identifier_no} onChange={set("identifier_no")} placeholder="예: 5020305920" />
            </Grid>
          </Section>

          <Section title="제조 및 규제 코드" desc="제조 원산지와 관세 분류 코드는 EU 통관 및 시장 감시 신고에 필요합니다.">
            <Grid>
              <SelectField label="제조 국가" value={f.manufacturing_country} onChange={set("manufacturing_country")} options={[...MANUFACTURING_COUNTRIES]} />
              <div>
                <Label info>HS Code</Label>
                <SearchSelect
                  value={f.hs_code}
                  onChange={set("hs_code")}
                  options={HS_CODES.map((h) => ({ value: h.code, label: h.label }))}
                  placeholder="코드 검색 또는 선택"
                  allowFreeInput
                  freeInputHint={(q) => `"${q}" 코드 직접 입력`}
                />
              </div>
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
              <div>
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
              <div>
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
                <input
                  type="date"
                  value={f.eu_launch_date}
                  onChange={(e) => set("eu_launch_date")(e.target.value)}
                  className={cx(inputCls, !f.eu_launch_date && "text-slate-300")}
                />
              </div>
              <div>
                <Label>EU 판매 예정국가</Label>
                <MultiSelectField
                  values={euCountries}
                  onChange={(next) => {
                    setDirty(true);
                    setEuCountries(next);
                  }}
                  options={EU_COUNTRIES}
                  placeholder="선택"
                  summary={(v) => `${v.length}개국 선택됨`}
                />
              </div>
              <UnitNumberField
                label="EU 연간 예상 수량"
                value={f.eu_annual_volume}
                onChange={set("eu_annual_volume")}
                unit={attrs[PK.euVolumeUnit] ?? VOLUME_UNITS[0]}
                onUnit={(v) => setAttr(PK.euVolumeUnit, v)}
                units={[...VOLUME_UNITS]}
              />
            </Grid>
          </Section>

          <Section
            title="기타"
            desc="식품 접촉 및 신체 접촉 민감도 여부입니다. 해당 사항이 있을 경우 추가 소재 규정이 적용될 수 있습니다."
          >
            <Grid>
              <YesNoField
                label="식품 접촉여부"
                name="food_contact"
                value={attrs[PK.foodContact] ?? ""}
                onChange={(v) => setAttr(PK.foodContact, v)}
              />
              <YesNoField
                label="Contact-sensitive 여부"
                name="contact_sensitive"
                value={f.contact_sensitive}
                onChange={set("contact_sensitive")}
              />
            </Grid>
          </Section>

          <section className="rounded-2xl border border-slate-200 bg-white p-7">
            <h2 className="border-b border-slate-100 pb-4 text-base font-bold text-ink">
              첨부 문서 ({PRODUCT_DOCS.length})
            </h2>
            {mode === "create" && (
              <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                지금 고른 파일은 저장 버튼을 눌러 제품이 만들어진 뒤에 업로드됩니다.
              </p>
            )}
            <div className="mt-2">
              <DocChecklist
                variant="plain"
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
            </div>
          </section>
        </div>

        {/* 우측: 일괄 업로드 · AI 도우미 (등록 모드에서만) */}
        {mode === "create" && (
          <div className="space-y-5">
            <section className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-bold text-ink">XLS로 업로드</h2>
                <button
                  type="button"
                  onClick={onOpenCsv}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
                >
                  <Upload className="h-4 w-4" /> XLS 업로드
                </button>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                우리 회사에 엑셀 형식으로 저장된 제품 정보를 왼쪽에 한번에 입력하고 정보를 수정할 수 있어요.
              </p>
            </section>

            <AiFillPanel onAction={handleAiAction} />
          </div>
        )}
      </div>

      {footer}

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
function Grid({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}
function Label({ children, required, info }: { children: ReactNode; required?: boolean; info?: boolean }) {
  return (
    <label className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-700">
      <span>
        {children} {required && <span className="text-danger">*</span>}
      </span>
      {info && <Info className="h-3.5 w-3.5 text-slate-300" />}
    </label>
  );
}
function TextField({
  label, value, onChange, required, placeholder, info,
}: { label: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string; info?: boolean }) {
  return (
    <div>
      <Label required={required} info={info}>{label}</Label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />
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
const unitSelectCls =
  "shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-primary";

function WeightField({
  label, value, unit, onChange, onUnit,
}: { label: string; value: string; unit: string; onChange: (v: string) => void; onUnit: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2">
        <input type="number" step="0.01" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0.00" className={inputCls} />
        <select value={unit} onChange={(e) => onUnit(e.target.value)} className={unitSelectCls}>
          {WEIGHT_UNITS.map((u) => (
            <option key={u}>{u}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
function UnitNumberField({
  label, value, unit, units, onChange, onUnit,
}: {
  label: string; value: string; unit: string; units: string[];
  onChange: (v: string) => void; onUnit: (v: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2">
        <input type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0.00" className={inputCls} />
        <select value={unit} onChange={(e) => onUnit(e.target.value)} className={unitSelectCls}>
          {units.map((u) => (
            <option key={u}>{u}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
function YesNoField({
  label, name, value, onChange,
}: { label: string; name: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label info>{label}</Label>
      <div className="flex items-center gap-6 py-2.5">
        {["예", "아니오"].map((opt) => (
          <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name={name}
              value={opt}
              checked={value === opt}
              onChange={() => onChange(opt)}
              className="h-4 w-4 accent-primary"
            />
            {opt}
          </label>
        ))}
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
  const cell = "w-full min-w-0 rounded-lg border border-slate-300 px-3 py-3 text-center text-sm outline-none placeholder:text-slate-300 focus:border-primary";
  return (
    <div className="flex items-center gap-1.5">
      <input type="number" step="0.01" value={w} onChange={(e) => onW(e.target.value)} placeholder="W" className={cell} />
      <span className="shrink-0 text-slate-400">x</span>
      <input type="number" step="0.01" value={h} onChange={(e) => onH(e.target.value)} placeholder="H" className={cell} />
      <span className="shrink-0 text-slate-400">x</span>
      <input type="number" step="0.01" value={d} onChange={(e) => onD(e.target.value)} placeholder="D" className={cell} />
      <select value={unit} onChange={(e) => onUnit(e.target.value)} className={unitSelectCls}>
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
        <Upload className="h-4 w-4" /> {busy ? "업로드 중…" : "파일 첨부"}
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
