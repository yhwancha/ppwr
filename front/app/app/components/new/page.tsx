"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Topbar from "@/components/app/Topbar";
import ComponentMasterForm, { type ComponentMasterFormValues } from "@/components/component/ComponentMasterForm";
import { getPpwrComponentService } from "@/src/shared/api";

export default function ComponentNewPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [err, setErr] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: (v: ComponentMasterFormValues) => getPpwrComponentService().createMaster(v),
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ["ppwr", "component-library"] });
      router.push(`/app/components/${created.id}`);
    },
    onError: (e) => setErr(e instanceof Error ? e.message : "부품 등록에 실패했습니다."),
  });

  return (
    <>
      <Topbar crumbs={[{ label: "부품 라이브러리", href: "/app/components" }, { label: "부품 등록" }]} />
      <ComponentMasterForm
        title="부품 등록"
        subtitle="부품 기본 정보를 저장한 뒤, 상세 화면에서 소재를 추가할 수 있습니다."
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
