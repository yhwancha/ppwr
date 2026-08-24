"use client";

import { use, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Clock, Image as ImageIcon, PencilLine, Trash2 } from "lucide-react";
import Topbar from "@/components/app/Topbar";
import { cx } from "@/components/primitives";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { GENERIC_ERROR, useToast } from "@/components/ui/Toast";
import DocChecklist from "@/components/common/DocChecklist";
import ComponentComposition from "@/components/product/ComponentComposition";
import { useEntityDocs } from "@/components/common/use-entity-files";
import {
  getPpwrComponentService,
  getPpwrEvidenceService,
  getPpwrProductService,
} from "@/src/shared/api";
import {
  PK,
  productAttrList,
  productCompletion,
  readProductAttrs,
} from "@/src/lib/ppwr-product-attrs";
import { PRODUCT_DOCS } from "@/src/lib/ppwr-product-spec";

/**
 * 제품 상세 — 부품 상세(app/app/components/[id]/page.tsx)와 같은 구조.
 *   헤더(이름·SKU·상태·삭제/수정) → 지표 4종 → 본문(읽기 전용 섹션) + 사이드(부품·문서·등록정보)
 *
 * 이전에는 구버전 편집 폼(ProductForm)을 그대로 띄워 "상세"가 아니라 "수정 화면"이었다.
 * 편집은 /app/products/[id]/edit (ProductFormV2) 로 분리돼 있다.
 */
const STATUS_LABEL: Record<string, string> = {
  draft: "작성중",
  undiagnosed: "미진단",
  needs_supplement: "보완 필요",
  noncompliant: "부적합",
  compliant: "적합",
};
const STATUS_CLASS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-500",
  undiagnosed: "bg-sky-50 text-sky-600",
  needs_supplement: "bg-amber-50 text-amber-700",
  noncompliant: "bg-red-50 text-red-600",
  compliant: "bg-emerald-50 text-emerald-700",
};

const SOURCE_LABEL: Record<string, string> = {
  customer_own: "고객 자체 개발·구매",
  revation_supplied: "리베이션 공급",
};

/** 값과 단위를 합쳐 보여준다. 값이 없으면 null 이라 Pair 가 — 로 처리한다. */
function withUnit(value: number | null | undefined, unit: string | null | undefined) {
  return value == null ? null : `${value} ${unit ?? ""}`.trim();
}

/** W × H × D 를 한 줄로. 셋 다 있어야 의미가 있다. */
function dimsText(
  w: number | null,
  h: number | null,
  d: number | null,
  unit: string | null,
) {
  if (w == null || h == null || d == null) return null;
  return `W ${w} × H ${h} × D ${d} ${unit ?? "mm"}`;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const productId = Number(id);
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();
  const svc = getPpwrProductService();
  const evidence = getPpwrEvidenceService();

  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["ppwr", "products", productId],
    queryFn: () => svc.get(productId),
  });
  const { data: instances = [] } = useQuery({
    queryKey: ["ppwr", "product-components", productId],
    queryFn: () => getPpwrComponentService().listInstances(productId),
  });

  const attrs = useMemo(() => readProductAttrs(product), [product]);
  const docs = useEntityDocs("product", productId, PRODUCT_DOCS);

  const photoPaths = useMemo(() => productAttrList(attrs, PK.photos), [attrs]);
  const { data: photoUrls } = useQuery({
    queryKey: ["ppwr", "product-photos", productId, photoPaths.join(",")],
    queryFn: () => evidence.signedUrls(photoPaths),
    enabled: photoPaths.length > 0,
  });

  const completion = product ? productCompletion(product) : 0;

  const remove = useMutation({
    mutationFn: async () => {
      const check = await svc.checkRemovable(productId);
      if (!check.ok) throw new Error(check.reason);
      await svc.remove(productId);
    },
    onSuccess: () => {
      toast.show("success", "성공적으로 삭제했습니다.");
      qc.invalidateQueries({ queryKey: ["ppwr", "products"] });
      router.push("/app/products");
    },
    onError: (e) => toast.show("danger", e instanceof Error ? e.message : GENERIC_ERROR),
  });

  if (isLoading) {
    return (
      <>
        <Topbar crumbs={[{ label: "제품 관리", href: "/app/products" }]} />
        <p className="p-8 text-sm text-slate-400">불러오는 중…</p>
      </>
    );
  }
  if (error || !product) {
    return (
      <>
        <Topbar crumbs={[{ label: "제품 관리", href: "/app/products" }]} />
        <p className="m-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
          제품을 불러오지 못했습니다.
        </p>
      </>
    );
  }

  const status = product.status ?? "draft";

  return (
    <>
      <Topbar crumbs={[{ label: "제품 관리", href: "/app/products" }, { label: product.name }]} />
      <div className="px-8 pb-24">
        {/* 헤더 */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/app/products"
              aria-label="목록으로"
              className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-ink"
            >
              <ChevronLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-extrabold text-ink">{product.name}</h1>
            {product.sku && (
              <span className="text-sm font-semibold text-slate-400">{product.sku}</span>
            )}
            <span
              className={cx(
                "rounded-md px-2 py-0.5 text-[11px] font-bold",
                STATUS_CLASS[status] ?? STATUS_CLASS.draft,
              )}
            >
              {STATUS_LABEL[status] ?? status}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              disabled={remove.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-danger hover:bg-red-50 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" /> 제품 삭제
            </button>
            <Link
              href={`/app/products/${productId}/edit`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              <PencilLine className="h-4 w-4" /> 수정
            </Link>
          </div>
        </div>

        {/* 상단 지표 */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile label="제품 카테고리" value={product.category ?? "—"} />
          <StatTile label="구성 부품" value={`${instances.length}개`} />
          <StatTile label="필수 입력 완료율" value={`${completion}%`} />
          <StatTile label="첨부 문서 확보율" value={`${docs.completion}%`} />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_400px]">
          {/* 본문 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7">
            <Block title="기본 제품 정보">
              <div className="mb-5">
                <p className="mb-2 text-sm font-semibold text-slate-700">제품 사진</p>
                {photoPaths.length === 0 ? (
                  <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-slate-300">
                    <ImageIcon className="h-5 w-5" />
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {photoPaths.map((p) => {
                      const url = photoUrls?.get(p);
                      return url ? (
                        // 서명 URL 이라 next/image 최적화 대상이 아니다
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={p} src={url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                      ) : (
                        <span
                          key={p}
                          className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-slate-300"
                        >
                          <ImageIcon className="h-5 w-5" />
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
              <Pairs>
                <Pair label="제품명 (영문)" value={product.name} />
                <Pair label="제품명 (국문)" value={product.name_ko} />
                <Pair label="SKU" value={product.sku} />
                <Pair label="모델명" value={product.model_name} />
                <Pair label="제품 카테고리" value={product.category} />
                <Pair label="식별번호" value={product.identifier_no} />
                <Pair label="공급 형태" value={SOURCE_LABEL[product.source] ?? product.source} />
              </Pairs>
            </Block>

            <Block title="제조 및 규제 코드">
              <Pairs>
                <Pair label="제조 국가" value={product.manufacturing_country} />
                <Pair label="HS Code" value={product.hs_code} />
              </Pairs>
            </Block>

            <Block title="제품 물성 정보">
              <Pairs>
                <Pair label="내용물 형태" value={product.content_form} />
                <Pair label="보관 조건" value={product.storage_condition} />
                <Pair
                  label="제품 Net 중량"
                  value={withUnit(product.net_weight, product.net_weight_unit)}
                />
                <Pair
                  label="제품 Net 치수"
                  value={dimsText(
                    product.net_width,
                    product.net_height,
                    product.net_depth,
                    product.net_dim_unit,
                  )}
                />
              </Pairs>
            </Block>

            <Block title="최종 포장 정보">
              <Pairs>
                <Pair
                  label="최종 포장 Gross 중량"
                  value={withUnit(product.gross_weight, product.gross_weight_unit)}
                />
                <Pair
                  label="최종 포장 Gross 치수"
                  value={dimsText(
                    product.gross_width,
                    product.gross_height,
                    product.gross_depth,
                    product.gross_dim_unit,
                  )}
                />
              </Pairs>
            </Block>

            <Block title="EU 시장 출시 계획">
              <Pairs>
                <Pair label="EU 시장 출시 형태" value={product.eu_market_status} />
                <Pair label="EU 출시 예정일" value={product.eu_launch_date} />
                <Pair label="EU 판매 예정국가" value={product.eu_launch_countries} />
                <Pair
                  label="EU 연간 예상 수량"
                  value={withUnit(product.eu_annual_volume, attrs[PK.euVolumeUnit] ?? "units (개)")}
                />
                <Pair label="비고" value={product.eu_launch_note} />
              </Pairs>
            </Block>

            <Block title="기타" last>
              <Pairs>
                <Pair label="식품 접촉여부" value={attrs[PK.foodContact]} />
                <Pair label="Contact-sensitive 여부" value={product.contact_sensitive ? "예" : "아니오"} />
                <Pair label="고객 역할" value={product.customer_role} />
                <Pair label="판매 채널" value={product.sales_channel} />
              </Pairs>
            </Block>
          </div>

          {/* 부품 구성 — 읽기 전용 목록이 아니라 추가·제거가 되는 편집 영역이다.
              (이전 상세의 ComponentManager 가 하던 일을 시안 반영본으로 대체) */}
          <div className="xl:col-span-2">
            <ComponentComposition
              productId={productId}
              returnTo={`/app/products/${productId}`}
            />
          </div>

          {/* 사이드 */}
          <div className="space-y-5">
            <aside className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-base font-bold text-ink">
                첨부 문서 ({docs.entries.reduce((n, e) => n + e.files.length, 0)})
              </h2>
              {docs.error && (
                <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-danger">
                  {docs.error}
                </p>
              )}
              <div className="mt-4">
                <DocChecklist
                  entries={docs.entries}
                  onPick={(docName, files) => void docs.pick(docName, files)}
                  onRemove={(docName, file) => void docs.remove(docName, file)}
                  onDownload={(file) => void docs.download(file)}
                  busyKey={docs.busyKey}
                />
              </div>
            </aside>

            <aside className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-base font-bold text-ink">등록 정보</h2>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400">최종 수정일</p>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    {new Date(product.updated_at).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400">등록일</p>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    {new Date(product.created_at).toLocaleDateString("ko-KR")}
                  </p>
                </div>
              </div>
              <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="h-3.5 w-3.5" /> 수정 기록은 이력 테이블이 생긴 뒤 제공됩니다.
              </p>
            </aside>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="정말 선택한 항목을 삭제하시겠습니까?"
        description="삭제 후에는 되돌릴 수 없습니다."
        confirmLabel="삭제"
        tone="danger"
        pending={remove.isPending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false);
          remove.mutate();
        }}
      />
    </>
  );
}

/* ────────────────────────── 표시용 프리미티브 ────────────────────────── */

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
      <p className="text-xs font-semibold text-slate-400">{label}</p>
      <p className="mt-1 truncate text-xl font-extrabold text-ink">{value}</p>
    </div>
  );
}

function Block({ title, children, last }: { title: string; children: ReactNode; last?: boolean }) {
  return (
    <section className={cx(!last && "mb-8")}>
      <h2 className="border-b border-slate-200 pb-3 text-lg font-bold text-ink">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Pairs({ children }: { children: ReactNode }) {
  return <dl className="grid gap-5 sm:grid-cols-2">{children}</dl>;
}

function Pair({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-slate-700">{label}</dt>
      <dd className="mt-1 text-sm text-slate-500">{value?.trim() ? value : "—"}</dd>
    </div>
  );
}
