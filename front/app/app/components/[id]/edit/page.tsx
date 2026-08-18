"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Topbar from "@/components/app/Topbar";
import ComponentForm from "@/components/component/ComponentForm";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { getPpwrComponentService } from "@/src/shared/api";

/** 진단이 확정(적합)된 제품에서 쓰이는 부품을 고칠 때 띄우는 경고 문구 */
const DIAGNOSED_WARNING = {
  title: "이 부품은 진단이 확정된 제품에서 사용 중입니다.",
  description:
    "부품의 정보를 수정 후 저장하면 해당 부품을 사용하는 모든 제품의 재진단이 필요하며, 비용이 발생할 수 있습니다.",
};

export default function ComponentEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const componentId = Number(id);
  const router = useRouter();
  const svc = getPpwrComponentService();

  const { data: master, isLoading, error } = useQuery({
    queryKey: ["ppwr", "component", componentId],
    queryFn: () => svc.getMaster(componentId),
  });
  const { data: products } = useQuery({
    queryKey: ["ppwr", "component-products", componentId],
    queryFn: () => svc.productsUsing(componentId),
  });

  // 진단이 확정된 제품에 물려 있으면 편집 진입 시 한 번, 저장 직전에 한 번 더 확인받는다
  const locked = (products ?? []).some((p) => p.status === "compliant");
  const [gateOpen, setGateOpen] = useState(false);
  const [gatePassed, setGatePassed] = useState(false);

  useEffect(() => {
    if (locked && !gatePassed) setGateOpen(true);
  }, [locked, gatePassed]);

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

  return (
    <>
      <Topbar
        crumbs={[
          { label: "부품 관리", href: "/app/components" },
          { label: master.name, href: `/app/components/${componentId}` },
          { label: "수정" },
        ]}
      />
      <ComponentForm
        mode="edit"
        typeKey={master.type ?? ""}
        master={master}
        confirmBeforeSave={locked ? DIAGNOSED_WARNING : null}
        onSaved={() => router.push(`/app/components/${componentId}`)}
        onCancel={() => router.push(`/app/components/${componentId}`)}
      />

      <ConfirmDialog
        open={gateOpen}
        title={DIAGNOSED_WARNING.title}
        description={DIAGNOSED_WARNING.description}
        confirmLabel="수정"
        onCancel={() => {
          setGateOpen(false);
          router.push(`/app/components/${componentId}`);
        }}
        onConfirm={() => {
          setGateOpen(false);
          setGatePassed(true);
        }}
      />
    </>
  );
}
