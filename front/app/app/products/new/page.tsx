"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Topbar from "@/components/app/Topbar";
import ProductForm, { type ProductFormValues } from "@/components/product/ProductForm";
import { getPpwrProductService } from "@/src/shared/api";

export default function ProductNewPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [err, setErr] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: (v: ProductFormValues) =>
      getPpwrProductService().create({ ...v, source: "customer_own", status: "draft" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ppwr", "products"] });
      router.push("/app/products");
    },
    onError: (e) => setErr(e instanceof Error ? e.message : "제품 등록에 실패했습니다."),
  });

  return (
    <>
      <Topbar crumbs={[{ label: "제품 관리", href: "/app/products" }, { label: "제품 등록" }]} />
      <ProductForm
        title="제품 등록"
        pending={isPending}
        error={err}
        onSubmit={(v) => {
          setErr(null);
          mutate(v);
        }}
      />
    </>
  );
}
