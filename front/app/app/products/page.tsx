"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Box,
  CheckCircle2,
  Clock,
  FileText,
  Globe,
  Image as ImageIcon,
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
import AgencyRequestModal from "@/components/product/AgencyRequestModal";
import { getPpwrProductService, getPpwrEvidenceService } from "@/src/shared/api";
import {
  decodeProductAttrs,
  missingProductItems,
  PK,
  productAttrList,
} from "@/src/lib/ppwr-product-attrs";
import {
  MANUFACTURING_COUNTRIES,
  PRODUCT_CATEGORIES,
  PRODUCT_STATE_CLASS,
  PRODUCT_STATE_LABEL,
  PRODUCT_TAB_STATES,
  REPORT_STATUS_OPTIONS,
  type ProductState,
} from "@/src/lib/ppwr-product-spec";
import type { PpwrProductWithAggregates } from "@/src/lib/ppwr-product-service";

type Tab = "all" | "undiagnosed" | "needs_supplement" | "compliant";

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "all", label: "전체", icon: LayoutGrid },
  { key: "undiagnosed", label: "미진단", icon: Clock },
  { key: "needs_supplement", label: "보완 필요", icon: AlertTriangle },
  { key: "compliant", label: "진단 확정", icon: ShieldCheck },
];

type Row = PpwrProductWithAggregates & {
  missingCount: number;
  thumbUrl?: string;
  euCountries: string[];
};

export default function ProductsPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const svc = getPpwrProductService();
  const evidence = getPpwrEvidenceService();

  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [fCategory, setFCategory] = useState<string[]>([]);
  const [fCountry, setFCountry] = useState<string[]>([]);
  const [fEuCountry, setFEuCountry] = useState<string[]>([]);
  const [fReport, setFReport] = useState<string[]>([]);
  const [fMissing, setFMissing] = useState<string[]>([]);
  const [sel, setSel] = useState<Set<number>>(new Set());
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [agencyOpen, setAgencyOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["ppwr", "products"],
    queryFn: async (): Promise<Row[]> => {
      const products = await svc.listWithAggregates();

      // 카드 썸네일: 제품마다 첫 사진 하나만, 서명 URL 은 한 번에 받는다
      const firstPhotos = new Map<number, string>();
      for (const p of products) {
        const photo = productAttrList(decodeProductAttrs(p.memo), PK.photos)[0];
        if (photo) firstPhotos.set(p.id, photo);
      }
      const urls = await evidence.signedUrls([...firstPhotos.values()]);

      return products.map((p) => {
        const photo = firstPhotos.get(p.id);
        return {
          ...p,
          missingCount: missingProductItems(p).length,
          thumbUrl: photo ? urls.get(photo) : undefined,
          euCountries: (p.eu_launch_countries ?? "")
            .split(/[;,]/)
            .map((s) => s.trim())
            .filter(Boolean),
        };
      });
    },
  });

  const rows = useMemo(() => data ?? [], [data]);

  /** 필터 선택지는 실제 데이터에서 뽑되, 기본 선택지는 항상 노출한다 */
  const options = useMemo(() => {
    const euSet = new Set<string>();
    const missingSet = new Set<string>();
    for (const r of rows) {
      for (const c of r.euCountries) euSet.add(c);
      for (const m of missingProductItems(r)) missingSet.add(m.label);
    }
    return {
      categories: [...PRODUCT_CATEGORIES],
      countries: [...MANUFACTURING_COUNTRIES],
      euCountries: [...euSet].sort(),
      reports: [...REPORT_STATUS_OPTIONS],
      missing: [...missingSet].sort(),
    };
  }, [rows]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (tab !== "all") {
        const allowed = PRODUCT_TAB_STATES[tab];
        if (!allowed.includes((r.status ?? "draft") as ProductState)) return false;
      }
      if (term) {
        const haystack = [r.name, r.name_ko, r.sku, r.model_name, r.identifier_no, String(r.id)]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (fCategory.length && !fCategory.includes(r.category ?? "")) return false;
      if (fCountry.length && !fCountry.includes(r.manufacturing_country ?? "")) return false;
      if (fEuCountry.length && !r.euCountries.some((c) => fEuCountry.includes(c))) return false;
      if (fReport.length) {
        const label = r.reportIssued ? "발행 완료" : "발행 전";
        if (!fReport.includes(label)) return false;
      }
      if (fMissing.length) {
        const labels = missingProductItems(r).map((m) => m.label);
        if (!labels.some((l) => fMissing.includes(l))) return false;
      }
      return true;
    });
  }, [rows, tab, q, fCategory, fCountry, fEuCountry, fReport, fMissing]);

  const hasFilter =
    q.trim() !== "" ||
    fCategory.length > 0 ||
    fCountry.length > 0 ||
    fEuCountry.length > 0 ||
    fReport.length > 0 ||
    fMissing.length > 0;

  function resetFilters() {
    setQ("");
    setFCategory([]);
    setFCountry([]);
    setFEuCountry([]);
    setFReport([]);
    setFMissing([]);
  }

  const del = useMutation({
    mutationFn: async (ids: number[]) => {
      const blocked: string[] = [];
      for (const id of ids) {
        const check = await svc.checkRemovable(id);
        if (!check.ok) {
          const name = rows.find((r) => r.id === id)?.name ?? `#${id}`;
          blocked.push(`${name} — ${check.reason}`);
        }
      }
      if (blocked.length) throw new Error(blocked.join(" / "));
      for (const id of ids) await svc.remove(id);
    },
    onSuccess: () => {
      toast.show("success", "성공적으로 삭제했습니다.");
      setSel(new Set());
      qc.invalidateQueries({ queryKey: ["ppwr", "products"] });
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
      <Topbar crumbs={[{ label: "제품 관리" }]} />
      <div className="px-8 pb-24">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-ink">
            제품 관리
            <span title="EU 수출 제품(SKU)을 등록하고 포장 구성·근거자료를 관리합니다.">
              <Package className="h-4 w-4 text-slate-300" />
            </span>
          </h1>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAgencyOpen(true)}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              제품 등록 대행 신청
            </button>
            <Link
              href="/app/products/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              <Plus className="h-4 w-4" /> 제품 등록
            </Link>
          </div>
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
            placeholder="제품명, 제품 ID, SKU 검색"
            className="w-full text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        {/* 필터 */}
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <MultiSelectFilter
            label="제품 카테고리"
            placeholder="제품 카테고리 선택"
            options={options.categories}
            selected={fCategory}
            onChange={setFCategory}
          />
          <MultiSelectFilter
            label="제조 국가"
            placeholder="제조 국가 선택"
            options={options.countries}
            selected={fCountry}
            onChange={setFCountry}
          />
          <MultiSelectFilter
            label="EU 판매 국가"
            placeholder="EU 판매 국가 선택"
            options={options.euCountries}
            selected={fEuCountry}
            onChange={setFEuCountry}
          />
          <MultiSelectFilter
            label="리포트 상태"
            placeholder="전체"
            options={options.reports}
            selected={fReport}
            onChange={setFReport}
          />
          <MultiSelectFilter
            label="누락 항목"
            placeholder="누락 항목 선택"
            options={options.missing}
            selected={fMissing}
            onChange={setFMissing}
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
              제품을 불러오지 못했습니다. 로그인 상태를 확인하세요.
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
                  등록된 제품이 없습니다.
                  <br />
                  새로운 제품을 등록하거나 제품 등록 대행 신청을 해보세요.
                </>
              )}
            </div>
          )}
          {filtered.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((r) => (
                <ProductCard key={r.id} row={r} checked={sel.has(r.id)} onToggle={() => toggle(r.id)} />
              ))}
            </div>
          )}
        </div>
      </div>

      <AgencyRequestModal open={agencyOpen} onClose={() => setAgencyOpen(false)} />

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

function ProductCard({ row, checked, onToggle }: { row: Row; checked: boolean; onToggle: () => void }) {
  const state = (row.status ?? "draft") as ProductState;
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
          <Link href={`/app/products/${row.id}`} className="block">
            <h3 className="truncate text-base font-bold text-ink hover:text-primary">{row.name}</h3>
            <p className="mt-0.5 truncate text-xs text-slate-400">
              {row.sku || "—"} <span className="mx-1 text-slate-200">|</span> {row.category ?? "미분류"}
            </p>
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className={cx("rounded-md px-2 py-0.5 text-[11px] font-bold", PRODUCT_STATE_CLASS[state])}>
            {PRODUCT_STATE_LABEL[state]}
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
        <Meta icon={Globe} label="제조" value={row.manufacturing_country ?? "—"} />
        <Meta icon={Globe} label="EU" value={row.euCountries.length ? `${row.euCountries.length}개국` : "—"} />
        <Meta icon={Box} label="부품" value={`${row.componentCount}개`} />
        <Meta icon={FileText} label="문서" value={`${row.docCount}개`} />
        <Meta icon={AlertTriangle} label="누락항목" value={`${row.missingCount}개`} />
        <Meta icon={FileText} label="리포트" value={row.reportIssued ? "발행 완료" : "발행 전"} />
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
