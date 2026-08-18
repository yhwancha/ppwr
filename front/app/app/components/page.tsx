"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Clock,
  FileText,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Package,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import Topbar from "@/components/app/Topbar";
import { cx } from "@/components/primitives";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { GENERIC_ERROR, useToast } from "@/components/ui/Toast";
import MultiSelectFilter from "@/components/component/MultiSelectFilter";
import TypePickerModal from "@/components/component/TypePickerModal";
import { getPpwrComponentService, getPpwrEvidenceService } from "@/src/shared/api";
import {
  AK,
  attrList,
  COMPONENT_STATE_CLASS,
  COMPONENT_STATE_LABEL,
  decodeAttrs,
  deriveComponentState,
  docStateFrom,
  missingRequired,
  requiredCompletion,
  type ComponentAttrs,
  type ComponentState,
} from "@/src/lib/ppwr-component-attrs";
import { PACKAGING_LEVELS, specForType, TYPE_KEYS } from "@/src/lib/ppwr-component-spec";
import type { ComponentMasterWithUsage } from "@/src/lib/ppwr-component-service";

/** 시안 탭: 전체 / 미진단 / 보완 필요 / 적합 */
const TABS: { key: "all" | ComponentState; label: string; icon: React.ElementType }[] = [
  { key: "all", label: "전체", icon: LayoutGrid },
  { key: "undiagnosed", label: "미진단", icon: Clock },
  { key: "needs_supplement", label: "보완 필요", icon: AlertTriangle },
  { key: "compliant", label: "적합", icon: ShieldCheck },
];

type Row = ComponentMasterWithUsage & {
  attrs: ComponentAttrs;
  state: ComponentState;
  missingCount: number;
  docCount: number;
  thumbUrl?: string;
};

export default function ComponentsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();
  const svc = getPpwrComponentService();
  const evidence = getPpwrEvidenceService();

  const [tab, setTab] = useState<"all" | ComponentState>("all");
  const [q, setQ] = useState("");
  const [fLevel, setFLevel] = useState<string[]>([]);
  const [fSupplier, setFSupplier] = useState<string[]>([]);
  const [fType, setFType] = useState<string[]>([]);
  const [fProduct, setFProduct] = useState<string[]>([]);
  const [sel, setSel] = useState<Set<number>>(new Set());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["ppwr", "component-library"],
    queryFn: async (): Promise<Row[]> => {
      const masters = await svc.listLibraryWithUsage();
      const docsByComponent = await evidence.listForComponents(masters.map((m) => m.id));

      // 카드 썸네일: 부품마다 첫 사진 하나만, 서명 URL 은 한 번에 받는다
      const firstPhotos = new Map<number, string>();
      for (const m of masters) {
        const photo = attrList(decodeAttrs(m.material_summary), AK.photos)[0];
        if (photo) firstPhotos.set(m.id, photo);
      }
      const urls = await evidence.signedUrls([...firstPhotos.values()]);

      return masters.map((m) => {
        const attrs = decodeAttrs(m.material_summary);
        const spec = specForType(m.type);
        const rows = docsByComponent.get(m.id) ?? [];
        const docStates = (spec?.docs ?? []).map((doc) => ({
          required: doc.required,
          state: docStateFrom(rows.filter((r) => r.document_type === doc.name).map((r) => r.status)),
        }));
        const completion = requiredCompletion(m, attrs);
        const photo = firstPhotos.get(m.id);
        return {
          ...m,
          attrs,
          state: deriveComponentState(completion, docStates),
          missingCount: missingRequired(m, attrs).length,
          docCount: rows.length,
          thumbUrl: photo ? urls.get(photo) : undefined,
        };
      });
    },
  });

  const rows = useMemo(() => data ?? [], [data]);

  /** 필터 선택지는 실제 데이터에서 뽑는다 (없는 값을 고르게 두지 않으려고) */
  const options = useMemo(() => {
    const suppliers = new Set<string>();
    const products = new Set<string>();
    for (const r of rows) {
      const s = r.attrs[AK.supplier];
      if (s) suppliers.add(s);
      for (const p of r.products) products.add(p.name);
    }
    return {
      levels: [...PACKAGING_LEVELS],
      suppliers: [...suppliers].sort(),
      types: TYPE_KEYS.filter((t) => rows.some((r) => r.type === t)),
      products: [...products].sort(),
    };
  }, [rows]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      // 작성중 부품은 아직 진단 전이라 '미진단' 탭에 함께 둔다
      if (tab !== "all") {
        const inTab =
          tab === "undiagnosed" ? r.state === "undiagnosed" || r.state === "draft" : r.state === tab;
        if (!inTab) return false;
      }
      if (term) {
        const haystack = [r.name, r.attrs[AK.nameKo], r.attrs[AK.bomId], r.type]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (fLevel.length && !fLevel.includes(r.attrs[AK.packagingLevel] ?? "")) return false;
      if (fSupplier.length && !fSupplier.includes(r.attrs[AK.supplier] ?? "")) return false;
      if (fType.length && !fType.includes(r.type ?? "")) return false;
      if (fProduct.length && !r.products.some((p) => fProduct.includes(p.name))) return false;
      return true;
    });
  }, [rows, tab, q, fLevel, fSupplier, fType, fProduct]);

  const hasFilter =
    q.trim() !== "" || fLevel.length > 0 || fSupplier.length > 0 || fType.length > 0 || fProduct.length > 0;

  function resetFilters() {
    setQ("");
    setFLevel([]);
    setFSupplier([]);
    setFType([]);
    setFProduct([]);
  }

  const del = useMutation({
    mutationFn: async (ids: number[]) => {
      // 시안 주석대로 연결 제품·첨부 문서가 남아 있으면 삭제하지 않는다
      const blocked: string[] = [];
      for (const id of ids) {
        const check = await svc.checkRemovable(id);
        if (!check.ok) {
          const name = rows.find((r) => r.id === id)?.name ?? `#${id}`;
          blocked.push(`${name} — ${check.reason}`);
        }
      }
      if (blocked.length) throw new Error(blocked.join(" / "));
      for (const id of ids) await svc.removeMaster(id);
    },
    onSuccess: () => {
      toast.show("success", "성공적으로 삭제했습니다.");
      setSel(new Set());
      qc.invalidateQueries({ queryKey: ["ppwr", "component-library"] });
    },
    onError: (e) => toast.show("danger", e instanceof Error ? e.message : GENERIC_ERROR),
  });

  function toggle(id: number) {
    setSel((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      <Topbar crumbs={[{ label: "부품 관리" }]} />
      <div className="px-8 pb-24">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-ink">
            부품 관리
            <span title="제품에 사용되는 포장 부품을 등록하고 PPWR 근거자료를 관리합니다.">
              <Boxes className="h-4 w-4 text-slate-300" />
            </span>
          </h1>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" /> 부품 등록
          </button>
        </div>

        {/* 상태 탭 */}
        <div className="mt-5 flex flex-wrap gap-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cx(
                  "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "bg-primary text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                )}
              >
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* 검색 */}
        <div className="mt-3 flex max-w-lg items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="부품명, 부품 ID, 유형 검색"
            className="w-full text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        {/* 필터 */}
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <MultiSelectFilter
            label="포장 단계"
            placeholder="포장 단계 선택"
            options={options.levels}
            selected={fLevel}
            onChange={setFLevel}
          />
          <MultiSelectFilter
            label="공급사"
            placeholder="공급사 선택"
            options={options.suppliers}
            selected={fSupplier}
            onChange={setFSupplier}
          />
          <MultiSelectFilter
            label="유형"
            placeholder="유형 선택"
            options={options.types}
            selected={fType}
            onChange={setFType}
          />
          <MultiSelectFilter
            label="연결된 제품"
            placeholder="연결된 제품 선택"
            options={options.products}
            selected={fProduct}
            onChange={setFProduct}
          />
          {hasFilter && (
            <button
              type="button"
              onClick={resetFilters}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-500 hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5" /> 필터 초기화
            </button>
          )}
        </div>

        {/* 개수 + 선택 액션 */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-500">총 {filtered.length}개</p>
          {sel.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-ink">{sel.size}개 선택</span>
              <button
                type="button"
                onClick={() => setSel(new Set())}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                선택 해제
              </button>
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                disabled={del.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-danger hover:bg-red-50 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" /> 삭제
              </button>
            </div>
          )}
        </div>

        <div className="mt-3">
          {isLoading && <p className="py-10 text-center text-sm text-slate-400">불러오는 중…</p>}
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-danger">
              부품을 불러오지 못했습니다. 로그인 상태를 확인하세요.
            </p>
          )}
          {data && filtered.length === 0 && (
            <div className="rounded-xl bg-slate-100 px-6 py-14 text-center text-sm leading-relaxed text-slate-500">
              {hasFilter || tab !== "all" ? (
                <>
                  검색 혹은 필터 결과가 없습니다.
                  <br />
                  필터를 초기화하거나 다른 검색어를 입력해 보세요.
                </>
              ) : (
                <>
                  등록된 부품이 없습니다.
                  <br />
                  새로운 부품을 등록해 보세요.
                </>
              )}
            </div>
          )}
          {filtered.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((r) => (
                <ComponentCard key={r.id} row={r} checked={sel.has(r.id)} onToggle={() => toggle(r.id)} />
              ))}
            </div>
          )}
        </div>
      </div>

      <TypePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(typeKey) => {
          setPickerOpen(false);
          router.push(`/app/components/new?type=${encodeURIComponent(typeKey)}`);
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="정말 선택한 항목을 삭제하시겠습니까?"
        description="삭제 후에는 되돌릴 수 없습니다."
        confirmLabel="삭제"
        tone="danger"
        pending={del.isPending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false);
          del.mutate([...sel]);
        }}
      />
    </>
  );
}

function ComponentCard({ row, checked, onToggle }: { row: Row; checked: boolean; onToggle: () => void }) {
  const level = row.attrs[AK.packagingLevel] ?? "—";
  const material = row.attrs[AK.materialDetail] || row.attrs[AK.materialGroup] || "—";
  const supplier = row.attrs[AK.supplier] ?? "—";
  const bom = row.attrs[AK.bomId];

  return (
    <div
      className={cx(
        "rounded-2xl border bg-white p-5 transition-colors",
        checked ? "border-primary ring-1 ring-primary/30" : "border-slate-200 hover:border-primary",
      )}
    >
      <div className="flex items-start gap-3">
        {row.thumbUrl ? (
          // 서명 URL 이라 next/image 최적화 대상이 아니다
          // eslint-disable-next-line @next/next/no-img-element
          <img src={row.thumbUrl} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-300">
            <ImageIcon className="h-5 w-5" />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <Link href={`/app/components/${row.id}`} className="block">
            <h3 className="truncate text-base font-bold text-ink hover:text-primary">{row.name}</h3>
            <p className="mt-0.5 truncate text-xs text-slate-400">
              {bom || "—"} <span className="mx-1 text-slate-200">|</span> {row.type ?? "미분류"}
            </p>
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={cx("rounded-md px-2 py-0.5 text-[11px] font-bold", COMPONENT_STATE_CLASS[row.state])}
          >
            {COMPONENT_STATE_LABEL[row.state]}
          </span>
          <button
            type="button"
            role="checkbox"
            aria-checked={checked}
            aria-label={`${row.name} 선택`}
            onClick={onToggle}
            className={cx(
              "flex h-5 w-5 items-center justify-center rounded border",
              checked ? "border-primary bg-primary text-white" : "border-slate-300 bg-white",
            )}
          >
            {checked && <CheckCircle2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500 xl:grid-cols-3">
        <Meta icon={Layers} label="포장 단계" value={level} />
        <Meta icon={Boxes} label="재질" value={material} />
        <Meta icon={Package} label="공급사" value={supplier} />
        <Meta icon={Package} label="연결 제품" value={`${row.products.length}개`} />
        <Meta icon={FileText} label="문서" value={`${row.docCount}개`} />
        <Meta icon={AlertTriangle} label="누락항목" value={`${row.missingCount}개`} />
      </dl>

      <p className="mt-3 text-[11px] text-slate-400">
        {new Date(row.updated_at).toLocaleDateString("ko-KR")} 수정
      </p>
    </div>
  );
}

function Meta({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 shrink-0 text-slate-300" />
      <dt className="shrink-0">{label}</dt>
      <dd className="truncate font-semibold text-slate-700">{value}</dd>
    </div>
  );
}
