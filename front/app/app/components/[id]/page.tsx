"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Topbar from "@/components/app/Topbar";
import ComponentMasterForm, { type ComponentMasterFormValues } from "@/components/component/ComponentMasterForm";
import MaterialEditor from "@/components/component/MaterialEditor";
import { getPpwrComponentService } from "@/src/shared/api";

export default function ComponentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const componentId = Number(id);
  const router = useRouter();
  const qc = useQueryClient();
  const svc = getPpwrComponentService();
  const [err, setErr] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["ppwr", "component", componentId],
    queryFn: () => svc.getMaster(componentId),
  });
  const { data: myId } = useQuery({
    queryKey: ["ppwr", "my-user-id"],
    queryFn: () => svc.currentUserId(),
  });

  // 내가 소유한 부품만 수정 가능. 공용(owner null)·타인 부품은 조회 전용.
  const readOnly = !data || myId == null || data.owner_user_id !== myId;

  const update = useMutation({
    mutationFn: (v: ComponentMasterFormValues) => svc.updateMaster(componentId, v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ppwr", "component-library"] });
      qc.invalidateQueries({ queryKey: ["ppwr", "component", componentId] });
      router.push("/app/components");
    },
    onError: (e) => setErr(e instanceof Error ? e.message : "저장에 실패했습니다."),
  });

  const remove = useMutation({
    mutationFn: () => svc.removeMaster(componentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ppwr", "component-library"] });
      router.push("/app/components");
    },
    onError: (e) => setErr(e instanceof Error ? e.message : "삭제에 실패했습니다."),
  });

  return (
    <>
      <Topbar crumbs={[{ label: "부자재 라이브러리", href: "/app/components" }, { label: data?.name ?? "부품 상세" }]} />
      {isLoading && <p className="p-8 text-sm text-slate-400">불러오는 중…</p>}
      {error && (
        <p className="m-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">부품을 불러오지 못했습니다.</p>
      )}
      {data && (
        <>
          <ComponentMasterForm
            title={data.name}
            subtitle={data.owner_user_id == null ? "리베이션 공용 부품" : data.type ?? undefined}
            defaults={data}
            readOnly={readOnly}
            pending={update.isPending}
            deleting={remove.isPending}
            error={err}
            onSubmit={(v) => {
              setErr(null);
              update.mutate(v);
            }}
            onDelete={() => {
              if (confirm(`"${data.name}" 부품을 삭제하시겠습니까?`)) {
                setErr(null);
                remove.mutate();
              }
            }}
          >
            <div className="mt-4">
              <MaterialEditor componentId={componentId} readOnly={readOnly} />
            </div>
          </ComponentMasterForm>
        </>
      )}
    </>
  );
}
