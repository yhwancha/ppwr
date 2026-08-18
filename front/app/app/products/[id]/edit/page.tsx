"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Topbar from "@/components/app/Topbar";
import ProductFormV2 from "@/components/product/ProductFormV2";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { getPpwrProductService } from "@/src/shared/api";

/** 진단이 확정된 제품을 고칠 때 띄우는 경고 (시안: 수정 진입 시 1회 + 저장 직전 1회) */
const DIAGNOSED_WARNING = {
  title: "이 제품은 진단이 확정된 상태입니다.",
  description:
    "제품 정보를 수정 후 저장하면 재진단이 필요하며, 비용이 발생할 수 있습니다.",
};

export default function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const productId = Number(id);
  const router = useRouter();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["ppwr", "products", productId],
    queryFn: () => getPpwrProductService().get(productId),
  });

  const locked = product?.status === "compliant";
  const [gateOpen, setGateOpen] = useState(false);
  const [gatePassed, setGatePassed] = useState(false);

  useEffect(() => {
    if (locked && !gatePassed) setGateOpen(true);
  }, [locked, gatePassed]);

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

  return (
    <>
      <Topbar
        crumbs={[
          { label: "제품 관리", href: "/app/products" },
          { label: product.name, href: `/app/products/${productId}` },
          { label: "수정" },
        ]}
      />
      <ProductFormV2
        mode="edit"
        product={product}
        confirmBeforeSave={locked ? DIAGNOSED_WARNING : null}
        onSaved={() => router.push(`/app/products/${productId}`)}
        onCancel={() => router.push(`/app/products/${productId}`)}
      />
      <ConfirmDialog
        open={gateOpen}
        title={DIAGNOSED_WARNING.title}
        description={DIAGNOSED_WARNING.description}
        confirmLabel="수정"
        onCancel={() => {
          setGateOpen(false);
          router.push(`/app/products/${productId}`);
        }}
        onConfirm={() => {
          setGateOpen(false);
          setGatePassed(true);
        }}
      />
    </>
  );
}
