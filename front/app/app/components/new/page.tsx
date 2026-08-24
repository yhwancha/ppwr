"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Topbar from "@/components/app/Topbar";
import ComponentForm from "@/components/component/ComponentForm";
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
        onSaved={(id) => router.push(`/app/components/${id}`)}
        onCancel={() => router.push("/app/components")}
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
