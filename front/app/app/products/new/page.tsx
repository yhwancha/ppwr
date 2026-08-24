"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/app/Topbar";
import ProductFormV2 from "@/components/product/ProductFormV2";
import CsvUploadModal from "@/components/product/CsvUploadModal";

export default function ProductNewPage() {
  const router = useRouter();
  const [csvOpen, setCsvOpen] = useState(false);

  return (
    <>
      <Topbar crumbs={[{ label: "제품 관리", href: "/app/products" }, { label: "제품 등록" }]} />
      <ProductFormV2
        mode="create"
        onSaved={(id) => router.push(`/app/products/${id}`)}
        onCancel={() => router.push("/app/products")}
        onOpenCsv={() => setCsvOpen(true)}
      />
      <CsvUploadModal
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        // 시안: 업로드 성공 시 "제품 등록 후" 목록으로 이동
        onDone={() => {
          setCsvOpen(false);
          router.push("/app/products");
        }}
      />
    </>
  );
}
