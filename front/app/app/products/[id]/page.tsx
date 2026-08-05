"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Topbar from "@/components/app/Topbar";
import ProductForm, { type ProductFormValues } from "@/components/product/ProductForm";
import PackagingStructure from "@/components/product/PackagingStructure";
import ComponentManager from "@/components/product/ComponentManager";
import { getPpwrProductService } from "@/src/shared/api";

const sourceLabel: Record<string, string> = {
  customer_own: "고객 자체 개발·구매",
  revation_supplied: "리베이션 공급",
};

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const productId = Number(id);
  const router = useRouter();
  const qc = useQueryClient();
  const [err, setErr] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["ppwr", "products", productId],
    queryFn: () => getPpwrProductService().get(productId),
  });

  const update = useMutation({
    mutationFn: (v: ProductFormValues) => getPpwrProductService().update(productId, v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ppwr", "products"] });
      qc.invalidateQueries({ queryKey: ["ppwr", "products", productId] });
      router.push("/app/products");
    },
    onError: (e) => setErr(e instanceof Error ? e.message : "저장에 실패했습니다."),
  });

  const remove = useMutation({
    mutationFn: () => getPpwrProductService().remove(productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ppwr", "products"] });
      router.push("/app/products");
    },
    onError: (e) => setErr(e instanceof Error ? e.message : "삭제에 실패했습니다."),
  });

  return (
    <>
      <Topbar crumbs={[{ label: "제품 관리", href: "/app/products" }, { label: data?.name ?? "제품 상세" }]} />
      {isLoading && <p className="p-8 text-sm text-slate-400">불러오는 중…</p>}
      {error && (
        <p className="m-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
          제품을 불러오지 못했습니다.
        </p>
      )}
      {data && (
        <ProductForm
          title={data.name}
          subtitle={
            <>
              {data.sku ?? "—"} <span className="mx-1 text-slate-300">|</span>{" "}
              {sourceLabel[data.source] ?? data.source}
            </>
          }
          defaults={data}
          pending={update.isPending}
          deleting={remove.isPending}
          error={err}
          onSubmit={(v) => {
            setErr(null);
            update.mutate(v);
          }}
          onDelete={() => {
            if (confirm(`"${data.name}" 제품을 삭제하시겠습니까?`)) {
              setErr(null);
              remove.mutate();
            }
          }}
        />
      )}
      {data && (
        <div className="px-8 pb-16">
          <PackagingStructure productId={productId} />
          <ComponentManager productId={productId} />
        </div>
      )}
    </>
  );
}
