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
import { useEntityDocs } from "@/components/common/use-entity-files";
import { getPpwrComponentService, getPpwrEvidenceService } from "@/src/shared/api";
import {
  AK,
  attrList,
  COMPONENT_STATE_CLASS,
  COMPONENT_STATE_LABEL,
  decodeAttrs,
  deriveComponentState,
  displayFieldValue,
  requiredCompletion,
} from "@/src/lib/ppwr-component-attrs";
import { specForType } from "@/src/lib/ppwr-component-spec";

const PRODUCT_STATUS_LABEL: Record<string, string> = {
  draft: "작성중",
  undiagnosed: "미진단",
  needs_supplement: "보완 필요",
  noncompliant: "부적합",
  compliant: "적합",
};

export default function ComponentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const componentId = Number(id);
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();
  const svc = getPpwrComponentService();
  const evidence = getPpwrEvidenceService();

  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: master, isLoading, error } = useQuery({
    queryKey: ["ppwr", "component", componentId],
    queryFn: () => svc.getMaster(componentId),
  });
  const { data: products = [] } = useQuery({
    queryKey: ["ppwr", "component-products", componentId],
    queryFn: () => svc.productsUsing(componentId),
  });

  const attrs = useMemo(() => decodeAttrs(master?.material_summary), [master?.material_summary]);
  const spec = specForType(master?.type);
  const docs = useEntityDocs("component", componentId, spec?.docs ?? []);

  const photoPaths = useMemo(() => attrList(attrs, AK.photos), [attrs]);
  const { data: photoUrls } = useQuery({
    queryKey: ["ppwr", "component-photos", componentId, photoPaths.join(",")],
    queryFn: () => evidence.signedUrls(photoPaths),
    enabled: photoPaths.length > 0,
  });

  const completion = master ? requiredCompletion(master, attrs) : 0;
  const state = deriveComponentState(completion, docs.states);

  const remove = useMutation({
    mutationFn: async () => {
      const check = await svc.checkRemovable(componentId);
      if (!check.ok) throw new Error(check.reason);
      await svc.removeMaster(componentId);
    },
    onSuccess: () => {
      toast.show("success", "성공적으로 삭제했습니다.");
      qc.invalidateQueries({ queryKey: ["ppwr", "component-library"] });
      router.push("/app/components");
    },
    onError: (e) => toast.show("danger", e instanceof Error ? e.message : GENERIC_ERROR),
  });

  if (isLoading) {
    return (
      <>
        <Topbar crumbs={[{ label: "부품 관리", href: "/app/components" }]} />
        <p className="p-8 text-sm text-slate-400">불러오는 중…</p>
      </>
    );
  }
  if (error || !master) {
    return (
      <>
        <Topbar crumbs={[{ label: "부품 관리", href: "/app/components" }]} />
        <p className="m-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
          부품을 불러오지 못했습니다.
        </p>
      </>
    );
  }

  const dims = [attrs[AK.dimW], attrs[AK.dimH], attrs[AK.dimD]].filter(Boolean);
  const dimText = dims.length === 3 ? `W ${dims[0]} × H ${dims[1]} × D ${dims[2]} ${attrs[AK.dimUnit] ?? "mm"}` : "—";
  const weightText = attrs[AK.unitWeight] ? `${attrs[AK.unitWeight]} ${attrs[AK.weightUnit] ?? "g/개"}` : "—";

  return (
    <>
      <Topbar crumbs={[{ label: "부품 관리", href: "/app/components" }, { label: master.name }]} />
      <div className="px-8 pb-24">
        {/* 헤더 */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/app/components"
              aria-label="목록으로"
              className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-ink"
            >
              <ChevronLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-extrabold text-ink">{master.name}</h1>
            {attrs[AK.bomId] && <span className="text-sm font-semibold text-slate-400">{attrs[AK.bomId]}</span>}
            <span className={cx("rounded-md px-2 py-0.5 text-[11px] font-bold", COMPONENT_STATE_CLASS[state])}>
              {COMPONENT_STATE_LABEL[state]}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              disabled={remove.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-danger hover:bg-red-50 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" /> 부품 삭제
            </button>
            <Link
              href={`/app/components/${componentId}/edit`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              <PencilLine className="h-4 w-4" /> 수정
            </Link>
          </div>
        </div>

        {/* 상단 지표 */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile label="현재 포장 형태" value={master.type ?? "—"} />
          <StatTile label="선택 재질" value={attrs[AK.materialDetail] || attrs[AK.materialGroup] || "—"} />
          <StatTile label="필수 입력 완료율" value={`${completion}%`} />
          <StatTile label="첨부 문서 확보율" value={`${docs.completion}%`} />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_400px]">
          {/* 본문 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7">
            <Block title="기본 정보">
              <div className="mb-5">
                <p className="mb-2 text-sm font-semibold text-slate-700">부품 사진</p>
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
                <Pair label="부품명 (영문)" value={master.name} />
                <Pair label="부품명 (국문)" value={attrs[AK.nameKo]} />
                <Pair label="포장 단계" value={attrs[AK.packagingLevel]} />
                <Pair label="BOM ID" value={attrs[AK.bomId]} />
                <Pair label="포장 형태" value={master.type} />
                <Pair label="세부 포장 형태" value={attrs[AK.subType]} />
                <Pair label="구성요소 구조" value={attrs[AK.elementStructure]} />
                <Pair label="제품당 사용수량" value={attrs[AK.qtyPerProduct] ? `${attrs[AK.qtyPerProduct]}개` : null} />
                <Pair label="공급사" value={attrs[AK.supplier]} />
              </Pairs>
            </Block>

            <Block title="재질 및 구조">
              <Pairs>
                <Pair label="재질군" value={attrs[AK.materialGroup]} />
                <Pair label="상세 재질명" value={attrs[AK.materialDetail]} />
                <Pair label="원료 Grade / 제품명" value={attrs[AK.grade]} />
                <Pair label="구조 구분" value={attrs[AK.materialStructure]} />
                <Pair label="개당 중량" value={weightText} />
                <Pair label="중량 출처" value={attrs[AK.weightSource]} />
                <Pair label="치수" value={dimText} />
                <Pair label="금속 포함 여부" value={attrs[AK.hasMetal]} />
                <Pair label="분리 여부" value={attrs[AK.separability]} />
                <Pair
                  label="재생원료(PCR) 함량"
                  value={master.recycled_content != null ? `${master.recycled_content}%` : null}
                />
              </Pairs>
            </Block>

            {spec && spec.fields.length > 0 && (
              <Block title={`${master.type} 전용 입력`} last>
                <Pairs>
                  {spec.fields.map((f) => (
                    <Pair key={f.key} label={f.label} value={displayFieldValue(f, attrs)} />
                  ))}
                </Pairs>
              </Block>
            )}
          </div>

          {/* 사이드 */}
          <div className="space-y-5">
            <aside className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-base font-bold text-ink">연결 제품 ({products.length})</h2>
              {products.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
                  이 부품을 사용하는 제품이 없습니다.
                </p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {products.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/app/products/${p.id}`}
                        className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 p-4 hover:border-primary"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-ink">{p.name}</p>
                          <p className="mt-0.5 truncate text-xs text-slate-400">
                            {p.sku ?? "—"} <span className="mx-1 text-slate-200">|</span> {p.category ?? "미분류"}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
                          {PRODUCT_STATUS_LABEL[p.status] ?? p.status}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </aside>

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
                    {new Date(master.updated_at).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400">등록일</p>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    {new Date(master.created_at).toLocaleDateString("ko-KR")}
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
