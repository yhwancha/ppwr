"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Image as ImageIcon, Info, Upload, X } from "lucide-react";
import { cx } from "@/components/primitives";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { GENERIC_ERROR, useToast } from "@/components/ui/Toast";
import DocChecklist from "@/components/common/DocChecklist";
import { useEntityDocs, useEntityPhotos } from "@/components/common/use-entity-files";
import { getPpwrComponentService } from "@/src/shared/api";
import {
  AK,
  attrList,
  decodeAttrs,
  encodeAttrs,
  MULTI_SEP,
  requiredCompletion,
  statusColumnsFromDocs,
  type ComponentAttrs,
} from "@/src/lib/ppwr-component-attrs";
import {
  ELEMENT_STRUCTURES,
  MATERIAL_GROUP_KEYS,
  MATERIAL_STRUCTURES,
  PACKAGING_LEVELS,
  SEPARABILITY,
  SUPPLIER_PRESETS,
  WEIGHT_SOURCES,
  materialDetailsFor,
  specForType,
  type SpecField,
} from "@/src/lib/ppwr-component-spec";
import type { ComponentMasterRow } from "@/src/lib/ppwr-component-service";

const WEIGHT_UNITS = ["g/개", "mg/개", "kg/개"];
const DIM_UNITS = ["mm", "cm"];

/**
 * 부품 등록·수정 공용 폼.
 *
 * 시안 구성: 상단 지표 4칸 → [기본 정보] · [재질 및 구조] · [<유형> 전용 입력] · [첨부 문서].
 * 유형은 등록 1단계(TypePickerModal)에서 정해지고 폼 안에서는 바뀌지 않는다.
 *
 * 저장까지 이 컴포넌트가 직접 처리한다. 등록 모드에서는 부품 row 가 없어 파일을 바로 못 올리므로
 * 저장 → 대기 파일 업로드 → (사진 경로가 생겼으면) 속성 재저장 순서로 이어붙인다.
 */
export default function ComponentForm({
  mode,
  typeKey,
  master,
  confirmBeforeSave,
  onSaved,
  onCancel,
}: {
  mode: "create" | "edit";
  typeKey: string;
  master?: ComponentMasterRow;
  /** 저장 직전에 한 번 더 확인받아야 할 때 (진단이 확정된 제품에서 사용 중인 부품) */
  confirmBeforeSave?: { title: string; description: string } | null;
  onSaved: (componentId: number) => void;
  onCancel: () => void;
}) {
  const qc = useQueryClient();
  const toast = useToast();
  const spec = specForType(typeKey);
  const componentId = master?.id ?? null;

  const [name, setName] = useState(master?.name ?? "");
  const [pcr, setPcr] = useState(master?.recycled_content != null ? String(master.recycled_content) : "");
  const [attrs, setAttrs] = useState<ComponentAttrs>(() => decodeAttrs(master?.material_summary));
  const [dirty, setDirty] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);

  const docs = useEntityDocs("component", componentId, spec?.docs ?? []);
  const photoPaths = useMemo(() => attrList(attrs, AK.photos), [attrs]);
  const photos = useEntityPhotos("component", componentId, photoPaths, (next) =>
    setAttr(AK.photos, next.join(MULTI_SEP)),
  );

  function setAttr(key: string, value: string) {
    setDirty(true);
    setAttrs((prev) => ({ ...prev, [key]: value }));
  }

  const completion = requiredCompletion({ name, type: typeKey }, attrs);
  const materialLabel = attrs[AK.materialDetail] || attrs[AK.materialGroup] || "—";

  async function persist() {
    setFormError(null);
    if (!name.trim()) {
      setFormError("부품명(영문)은 필수입니다.");
      return;
    }
    setSaving(true);
    const svc = getPpwrComponentService();
    try {
      const statusColumns = statusColumnsFromDocs(
        docs.entries.map((e) => ({ name: e.doc.name, state: e.state })),
      );
      const payload = {
        name: name.trim(),
        type: typeKey,
        material_summary: encodeAttrs(attrs, spec),
        recycled_content: pcr.trim() === "" ? null : Number(pcr),
        ...statusColumns,
      };

      let id: number;
      if (mode === "create") {
        const created = await svc.createMaster(payload);
        id = created.id;
        // 부품이 생긴 뒤에야 파일을 붙일 수 있다
        await docs.flushPending(id);
        const finalPhotos = await photos.flushPending(id);
        if (finalPhotos.length !== photoPaths.length) {
          await svc.updateMaster(id, {
            material_summary: encodeAttrs({ ...attrs, [AK.photos]: finalPhotos.join(MULTI_SEP) }, spec),
          });
        }
      } else {
        id = componentId as number;
        await svc.updateMaster(id, payload);
      }

      qc.invalidateQueries({ queryKey: ["ppwr", "component-library"] });
      qc.invalidateQueries({ queryKey: ["ppwr", "component", id] });
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
      {/* 헤더 */}
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
            {mode === "create" ? `‘${typeKey}’ 부품 등록` : `${master?.name ?? "부품"} 수정`}
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

      {/* 상단 지표 */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="현재 포장 형태" value={typeKey} />
        <StatTile label="선택 재질" value={materialLabel} />
        <StatTile label="필수 입력 완료율" value={`${completion}%`} />
        <StatTile label="첨부 문서 확보율" value={`${docs.completion}%`} />
      </div>

      {(formError || docs.error || photos.error) && (
        <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-danger">
          {formError ?? docs.error ?? photos.error}
        </p>
      )}

      <div className="mt-5 space-y-5">
        {/* ── 기본 정보 ── */}
        <Section title="기본 정보" desc="포장재 식별 및 기본 정보를 입력해주세요.">
          <div className="mb-5">
            <Label>부품 사진</Label>
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
            <TextField
              label="부품명 (영문)"
              required
              value={name}
              onChange={(v) => {
                setDirty(true);
                setName(v);
              }}
              placeholder="예: 500 mL Glass Beverage Bottle"
            />
            <TextField
              label="부품명 (국문)"
              value={attrs[AK.nameKo] ?? ""}
              onChange={(v) => setAttr(AK.nameKo, v)}
              placeholder="예: 유리 음료병 500ml"
            />
            <SelectField
              label="포장 단계"
              required
              value={attrs[AK.packagingLevel] ?? ""}
              onChange={(v) => setAttr(AK.packagingLevel, v)}
              options={[...PACKAGING_LEVELS]}
            />
            <TextField
              label="고객 BOM ID"
              value={attrs[AK.bomId] ?? ""}
              onChange={(v) => setAttr(AK.bomId, v)}
              placeholder="예: BM-1230"
            />
            <SelectField
              label="세부 포장 형태"
              required
              value={attrs[AK.subType] ?? ""}
              onChange={(v) => setAttr(AK.subType, v)}
              options={spec?.subTypes ?? []}
            />
            <SelectField
              label="구성요소 구조"
              required
              value={attrs[AK.elementStructure] ?? ""}
              onChange={(v) => setAttr(AK.elementStructure, v)}
              options={[...ELEMENT_STRUCTURES]}
            />
            <ComboField
              label="공급사"
              required
              value={attrs[AK.supplier] ?? ""}
              onChange={(v) => setAttr(AK.supplier, v)}
              options={[...SUPPLIER_PRESETS]}
              placeholder="입력 또는 선택"
            />
            <div>
              <Label required>제품당 사용수량</Label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  value={attrs[AK.qtyPerProduct] ?? ""}
                  onChange={(e) => setAttr(AK.qtyPerProduct, e.target.value)}
                  placeholder="1"
                  className={inputCls}
                />
                <span className="flex items-center whitespace-nowrap rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-500">
                  units (개)
                </span>
              </div>
            </div>
          </Grid>
        </Section>

        {/* ── 재질 및 구조 ── */}
        <Section title="재질 및 구조" desc="포장재를 구성하는 주요 재질과 세부 특성 정보를 입력해주세요.">
          <Grid>
            <SelectField
              label="재질군"
              required
              value={attrs[AK.materialGroup] ?? ""}
              onChange={(v) => {
                setAttr(AK.materialGroup, v);
                setAttr(AK.materialDetail, ""); // 재질군이 바뀌면 상세 재질은 무효
              }}
              options={spec?.materialGroups ?? MATERIAL_GROUP_KEYS}
            />
            <SelectField
              label="상세 재질명"
              required
              value={attrs[AK.materialDetail] ?? ""}
              onChange={(v) => setAttr(AK.materialDetail, v)}
              options={materialDetailsFor(attrs[AK.materialGroup])}
            />
            <TextField
              label="원료 Grade / 제품명"
              value={attrs[AK.grade] ?? ""}
              onChange={(v) => setAttr(AK.grade, v)}
              placeholder="Grade, resin code, trade name"
            />
            <SelectField
              label="구조 구분"
              required
              value={attrs[AK.materialStructure] ?? ""}
              onChange={(v) => setAttr(AK.materialStructure, v)}
              options={[...MATERIAL_STRUCTURES]}
            />
            <div>
              <Label required>개당 중량</Label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={attrs[AK.unitWeight] ?? ""}
                  onChange={(e) => setAttr(AK.unitWeight, e.target.value)}
                  placeholder="0.00"
                  className={inputCls}
                />
                <select
                  value={attrs[AK.weightUnit] ?? WEIGHT_UNITS[0]}
                  onChange={(e) => setAttr(AK.weightUnit, e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary"
                >
                  {WEIGHT_UNITS.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
            <SelectField
              label="중량 출처"
              value={attrs[AK.weightSource] ?? ""}
              onChange={(v) => setAttr(AK.weightSource, v)}
              options={[...WEIGHT_SOURCES]}
            />
            <div className="sm:col-span-2">
              <Label required>치수</Label>
              <div className="flex flex-wrap items-center gap-2">
                <DimInput value={attrs[AK.dimW] ?? ""} onChange={(v) => setAttr(AK.dimW, v)} placeholder="W" />
                <span className="text-slate-400">x</span>
                <DimInput value={attrs[AK.dimH] ?? ""} onChange={(v) => setAttr(AK.dimH, v)} placeholder="H" />
                <span className="text-slate-400">x</span>
                <DimInput value={attrs[AK.dimD] ?? ""} onChange={(v) => setAttr(AK.dimD, v)} placeholder="D" />
                <select
                  value={attrs[AK.dimUnit] ?? DIM_UNITS[0]}
                  onChange={(e) => setAttr(AK.dimUnit, e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-primary"
                >
                  {DIM_UNITS.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
            <SelectField
              label="금속 포함 여부"
              value={attrs[AK.hasMetal] ?? ""}
              onChange={(v) => setAttr(AK.hasMetal, v)}
              options={["예", "아니오"]}
            />
            <SelectField
              label="분리 여부"
              required
              value={attrs[AK.separability] ?? ""}
              onChange={(v) => setAttr(AK.separability, v)}
              options={[...SEPARABILITY]}
            />
            <NumberField
              label="재생원료(PCR) 함량"
              unit="%"
              value={pcr}
              onChange={(v) => {
                setDirty(true);
                setPcr(v);
              }}
            />
          </Grid>
        </Section>

        {/* ── 유형 전용 입력 ── */}
        {spec && spec.fields.length > 0 && (
          <Section
            title={`${typeKey} 전용 입력`}
            desc="포장 형태와 재질 선택에 따라 추가 입력 및 첨부문서가 전환됩니다."
          >
            <Grid>
              {spec.fields.map((f) => (
                <SpecInput key={f.key} field={f} value={attrs[f.key] ?? ""} onChange={(v) => setAttr(f.key, v)} />
              ))}
            </Grid>
          </Section>
        )}

        {/* ── 첨부 문서 ── */}
        <Section
          title="첨부 문서"
          desc="체크박스는 문서 확보 여부를 의미합니다. 각 문서가 무엇을 확인하기 위한 것인지 함께 표시됩니다."
        >
          {mode === "create" && (
            <p className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
              지금 고른 파일은 저장 버튼을 눌러 부품이 만들어진 뒤에 업로드됩니다.
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

/* ────────────────────────── 부품 사진 ────────────────────────── */

function PhotoPicker({
  paths,
  pending,
  busy,
  onAdd,
  onRemovePath,
  onRemovePending,
}: {
  paths: string[];
  pending: File[];
  busy: boolean;
  onAdd: (files: File[]) => void;
  onRemovePath: (path: string) => void;
  onRemovePending: (index: number) => void;
}) {
  return (
    <div>
      <label
        className={cx(
          "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50",
          busy && "pointer-events-none opacity-60",
        )}
      >
        <Upload className="h-4 w-4 text-amber-500" />
        {busy ? "업로드 중…" : "파일 첨부"}
        <input
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
      </label>
      <p className="mt-1 text-[10px] text-slate-400">최대 10개 / 개당 최대 100MB / jpg,png</p>

      {(paths.length > 0 || pending.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {paths.map((p) => (
            <PhotoChip key={p} label={p.split("/").pop() ?? "사진"} onRemove={() => onRemovePath(p)} />
          ))}
          {pending.map((f, i) => (
            <PhotoChip key={`p-${i}`} label={f.name} pendingUpload onRemove={() => onRemovePending(i)} />
          ))}
        </div>
      )}
    </div>
  );
}

function PhotoChip({
  label,
  onRemove,
  pendingUpload,
}: {
  label: string;
  onRemove: () => void;
  pendingUpload?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-400">
        <ImageIcon className="h-4 w-4" />
      </span>
      <span className="max-w-[140px] truncate text-xs font-semibold text-ink">{label}</span>
      {pendingUpload && <span className="text-[10px] text-slate-400">대기</span>}
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

/* ────────────────────────── 유형 전용 필드 렌더러 ────────────────────────── */

function SpecInput({
  field,
  value,
  onChange,
}: {
  field: SpecField;
  value: string;
  onChange: (v: string) => void;
}) {
  if (field.type === "text") {
    return <TextField label={field.label} required={field.required} hint={field.hint} value={value} onChange={onChange} placeholder="입력" />;
  }
  if (field.type === "number") {
    return <NumberField label={field.label} required={field.required} hint={field.hint} unit={field.unit} value={value} onChange={onChange} />;
  }
  if (field.type === "bool") {
    return (
      <div>
        <Label required={field.required} hint={field.hint}>
          {field.label}
        </Label>
        <div className="flex overflow-hidden rounded-lg border border-slate-300">
          {[
            ["true", "예"],
            ["false", "아니오"],
          ].map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              className={cx(
                "flex-1 py-3 text-sm font-semibold",
                value === v ? "bg-primary-soft text-primary" : "bg-white text-slate-500",
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    );
  }
  if (field.type === "multiselect") {
    const selected = value.split(MULTI_SEP).filter(Boolean);
    return (
      <div>
        <Label required={field.required} hint={field.hint}>
          {field.label}
        </Label>
        <div className="flex flex-wrap gap-2 rounded-lg border border-slate-300 p-2.5">
          {(field.options ?? []).map((o) => {
            const on = selected.includes(o);
            return (
              <button
                key={o}
                type="button"
                onClick={() =>
                  onChange(
                    (on ? selected.filter((s) => s !== o) : [...selected, o]).join(MULTI_SEP),
                  )
                }
                className={cx(
                  "rounded-md px-3 py-1.5 text-xs font-semibold",
                  on ? "bg-primary text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                )}
              >
                {o}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
  return (
    <SelectField
      label={field.label}
      required={field.required}
      hint={field.hint}
      value={value}
      onChange={onChange}
      options={field.options ?? []}
    />
  );
}

/* ────────────────────────── 프리미티브 ────────────────────────── */

const inputCls =
  "w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none placeholder:text-slate-300 focus:border-primary disabled:bg-slate-50";

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

function Label({
  children,
  required,
  hint,
}: {
  children: ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="mb-1.5">
      <label className="text-sm font-semibold text-slate-700">
        {children} {required && <span className="text-danger">*</span>}
      </label>
      {hint && <p className="text-[11px] leading-snug text-slate-400">{hint}</p>}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  required,
  hint,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <Label required={required} hint={hint}>
        {label}
      </Label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  required,
  hint,
  unit,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  hint?: string;
  unit?: string;
}) {
  return (
    <div>
      <Label required={required} hint={hint}>
        {label}
      </Label>
      <div className="flex gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className={inputCls}
        />
        {unit && (
          <span className="flex items-center whitespace-nowrap rounded-lg border border-slate-300 bg-slate-50 px-3 font-mono text-xs text-slate-500">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <Label required={required} hint={hint}>
        {label}
      </Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cx(inputCls, "bg-white", !value && "text-slate-300")}
      >
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

/** 값을 목록에서 고르거나 직접 적을 수 있는 입력 (공급사) */
function ComboField({
  label,
  value,
  onChange,
  options,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
  placeholder?: string;
}) {
  const listId = `combo-${label}`;
  return (
    <div>
      <Label required={required}>{label}</Label>
      <input
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
      <datalist id={listId}>
        {options.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
    </div>
  );
}

function DimInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="number"
      step="0.01"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-24 flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none placeholder:text-slate-300 focus:border-primary"
    />
  );
}
