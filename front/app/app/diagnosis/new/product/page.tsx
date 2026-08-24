"use client";

import { Suspense, useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronLeft, Info, Save } from "lucide-react";
import Topbar from "@/components/app/Topbar";
import { cx } from "@/components/primitives";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";
import ComponentComposition from "@/components/product/ComponentComposition";
import CsvUploadModal from "@/components/product/CsvUploadModal";
import ProductFormV2 from "@/components/product/ProductFormV2";

type Tab = "product" | "components";

const RETURN_TO = "/app/diagnosis/new/product";

/**
 * 진단 시작 → 새 제품 등록 (시안).
 *
 * 제품 관리의 등록 화면과 같은 폼(ProductFormV2)을 chrome="embedded" 로 끼워 넣고,
 * 헤더·탭·하단 조작부만 이 페이지가 갖는다. 부품 정보 탭은 저장된 제품에만 붙일 수 있어
 * 제품을 먼저 저장하도록 안내한다.
 */
function NewProductInner() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();

  // 새 부품 등록에서 돌아오면 어떤 제품이었는지 쿼리로 넘어온다
  const [productId, setProductId] = useState<number | null>(Number(params.get("productId")) || null);
  const [tab, setTab] = useState<Tab>(params.get("tab") === "components" ? "components" : "product");
  const [dirty, setDirty] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [unsavedOpen, setUnsavedOpen] = useState(false);
  /** 저장 후 이어서 할 동작 — '저장하고 다음' 에서 쓴다 */
  const [afterSave, setAfterSave] = useState<"none" | "components">("none");

  const handleDirty = useCallback((d: boolean) => setDirty(d), []);

  function handleSaved(id: number) {
    setProductId(id);
    toast.show("success", "성공적으로 등록했습니다.");
    if (afterSave === "components") {
      setTab("components");
      setAfterSave("none");
    }
  }

  function goNext() {
    if (dirty) setUnsavedOpen(true);
    else setTab("components");
  }

  function requestLeave() {
    if (dirty) setLeaveOpen(true);
    else router.push("/app/diagnosis/new");
  }

  /** 폼 밖 버튼에서 폼 submit 을 일으킨다 */
  function submitForm() {
    document.getElementById("diagnosis-product-form")?.dispatchEvent(
      new Event("submit", { cancelable: true, bubbles: true }),
    );
  }

  return (
    <>
      <Topbar
        crumbs={[
          { label: "진단 관리", href: "/app/diagnosis" },
          { label: "진단 시작", href: "/app/diagnosis/new" },
          { label: "새 제품 등록" },
        ]}
      />

      <div className="px-8 pb-24">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-center gap-3 text-2xl font-extrabold text-ink">
            <button
              type="button"
              onClick={requestLeave}
              aria-label="뒤로"
              className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-ink"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            제품 등록
            <Info className="h-4 w-4 text-slate-300" />
          </h1>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={requestLeave}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              취소
            </button>
            <button
              type="button"
              disabled={productId == null}
              onClick={() => router.push(`/app/diagnosis/new?productId=${productId}`)}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:bg-slate-200 disabled:text-slate-400"
            >
              제품 및 부품 등록 완료
            </button>
          </div>
        </div>

        {/* 탭 */}
        <div className="mt-6 flex gap-6 border-b border-slate-200">
          {([
            ["product", "제품 정보"],
            ["components", "부품 정보"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => (key === "components" ? goNext() : setTab("product"))}
              className={cx(
                "-mb-px border-b-2 px-1 pb-3 text-sm font-semibold transition-colors",
                tab === key
                  ? "border-ink text-ink"
                  : "border-transparent text-slate-400 hover:text-slate-600",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "product" ? (
            <ProductFormV2
              key={productId ?? "new"}
              mode="create"
              chrome="embedded"
              formId="diagnosis-product-form"
              onDirtyChange={handleDirty}
              onSaved={handleSaved}
              onCancel={requestLeave}
              onOpenCsv={() => setCsvOpen(true)}
              footer={
                <div className="mt-6 flex justify-center gap-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
                  >
                    <Save className="h-4 w-4" /> 저장
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    다음 <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              }
            />
          ) : (
            <>
              <ComponentComposition
                productId={productId}
                returnTo={productId ? `${RETURN_TO}?productId=${productId}&tab=components` : RETURN_TO}
              />
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTab("product")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <ArrowLeft className="h-4 w-4" /> 이전
                </button>
                <button
                  type="button"
                  disabled={productId == null}
                  onClick={() => router.push(`/app/diagnosis/new?productId=${productId}`)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:bg-slate-200 disabled:text-slate-400"
                >
                  <Save className="h-4 w-4" /> 저장
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <CsvUploadModal
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        onDone={(count) => {
          setCsvOpen(false);
          toast.show("success", `${count}개 제품을 성공적으로 등록했습니다.`);
          router.push("/app/products");
        }}
      />

      <ConfirmDialog
        open={unsavedOpen}
        title="저장하지 않은 항목이 있습니다."
        description="저장하고 다음으로 넘어갈까요?"
        cancelLabel="저장하지 않고 다음"
        confirmLabel="저장하고 다음"
        onCancel={() => {
          setUnsavedOpen(false);
          setTab("components");
        }}
        onConfirm={() => {
          setUnsavedOpen(false);
          setAfterSave("components");
          submitForm();
        }}
      />

      <ConfirmDialog
        open={leaveOpen}
        title="정말 나가시겠습니까?"
        description="지금 나가면 편집중인 항목이 저장되지 않습니다."
        confirmLabel="나가기"
        onCancel={() => setLeaveOpen(false)}
        onConfirm={() => {
          setLeaveOpen(false);
          router.push("/app/diagnosis/new");
        }}
      />
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-slate-400">불러오는 중…</p>}>
      <NewProductInner />
    </Suspense>
  );
}
