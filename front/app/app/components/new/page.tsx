"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Topbar from "@/components/app/Topbar";
import ComponentForm from "@/components/component/ComponentForm";
import ChatPanel from "@/components/chat/ChatPanel";
import { getPpwrComponentService } from "@/src/shared/api";
import { specForType } from "@/src/lib/ppwr-component-spec";

/**
 * 부품 등록 2단계.
 * 유형은 목록에서 띄운 TypePickerModal 이 정해서 `?type=` 로 넘겨준다.
 * (유형 없이 직접 들어오면 목록으로 되돌려 1단계부터 하게 한다)
 */
function ComponentNewInner() {
  const router = useRouter();
  const params = useSearchParams();
  const typeKey = params.get("type") ?? "";
  const spec = specForType(typeKey);

  // 진단 시작의 '새 부품 등록'으로 들어오면 저장 직후 그 제품에 바로 붙이고 되돌아간다.
  // (부품 등록 프로세스 자체는 부품 관리에서 들어올 때와 동일하다)
  const attachTo = Number(params.get("attachTo")) || null;
  const attachLevel = Number(params.get("level")) || 1;
  const returnTo = params.get("returnTo");

  async function handleSaved(id: number) {
    if (attachTo != null) {
      try {
        await getPpwrComponentService().addInstance(attachTo, id, {
          packaging_level: attachLevel,
        });
      } catch {
        // 붙이기에 실패해도 부품 자체는 저장됐다. 제품 쪽에서 '기존 부품 추가'로 붙일 수 있다.
      }
      router.push(returnTo ?? `/app/components/${id}`);
      return;
    }
    router.push(`/app/components/${id}`);
  }

  if (!spec) {
    return (
      <>
        <Topbar crumbs={[{ label: "부품 관리", href: "/app/components" }, { label: "부품 등록" }]} />
        <div className="px-8 pb-16">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="font-semibold text-ink">먼저 포장재 유형을 선택해야 합니다.</p>
            <p className="mt-1 text-sm text-slate-400">
              유형에 따라 입력 항목과 필요한 첨부 문서가 달라집니다.
            </p>
            <Link
              href="/app/components"
              className="mt-5 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              부품 관리로 이동
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar crumbs={[{ label: "부품 관리", href: "/app/components" }, { label: "부품 등록" }]} />
      <ComponentForm
        mode="create"
        typeKey={typeKey}
        aside={
          <ChatPanel className="h-[520px] xl:sticky xl:top-6 xl:h-[calc(100vh-9rem)]" />
        }
        onSaved={(id) => void handleSaved(id)}
        onCancel={() => router.push(returnTo ?? "/app/components")}
      />
    </>
  );
}

export default function ComponentNewPage() {
  // useSearchParams 는 Suspense 경계가 필요하다 (Next.js App Router)
  return (
    <Suspense fallback={<p className="p-8 text-sm text-slate-400">불러오는 중…</p>}>
      <ComponentNewInner />
    </Suspense>
  );
}
