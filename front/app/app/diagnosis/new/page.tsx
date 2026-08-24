"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Topbar from "@/components/app/Topbar";
import ReportSampleModal from "@/components/diagnosis/ReportSampleModal";
import { AiAssistant, Stepper, type StepNo } from "@/components/diagnosis/wizard/parts";
import StepIdentity, {
  EMPTY_IDENTITY,
  IDENTITY_REQUIRED,
  type IdentityForm,
} from "@/components/diagnosis/wizard/StepIdentity";
import StepProduct from "@/components/diagnosis/wizard/StepProduct";
import StepRun from "@/components/diagnosis/wizard/StepRun";
import { getPpwrDiagnosisService } from "@/src/shared/api";

function DiagnosisWizard() {
  const router = useRouter();
  const qc = useQueryClient();
  const params = useSearchParams();

  // 재진단으로 들어오면 대상 제품이 쿼리로 넘어온다
  const presetProduct = Number(params.get("productId")) || null;
  const isRediagnosis = presetProduct != null;

  const [step, setStep] = useState<StepNo>(1);
  const [identity, setIdentity] = useState<IdentityForm>(EMPTY_IDENTITY);
  const [productId, setProductId] = useState<number | null>(presetProduct);
  const [agreed, setAgreed] = useState(false);
  const [sampleOpen, setSampleOpen] = useState(false);
  // 위임 문서 — 붙일 진단 row 가 아직 없어 메모리에만 둔다 (parts.FilePickField 주석 참고)
  const [mandateFiles, setMandateFiles] = useState<File[]>([]);

  const missingIdentity = IDENTITY_REQUIRED.filter((k) => !identity[k]).length;

  const run = useMutation({
    mutationFn: async () => {
      if (productId == null) throw new Error("진단할 제품을 선택해 주세요.");
      return getPpwrDiagnosisService().start(productId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ppwr", "diagnosis"] });
      router.push("/app/diagnosis");
    },
  });

  const title = isRediagnosis ? "재진단" : "진단 시작";

  return (
    <>
      <Topbar crumbs={[{ label: "진단 관리", href: "/app/diagnosis" }, { label: title }]} />

      <div className="px-8 pb-24">
        {/* 헤더 */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="inline-flex items-center gap-3 text-2xl font-extrabold text-ink">
            <Link href="/app/diagnosis" aria-label="진단 관리로" className="text-slate-400 hover:text-ink">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            {title}
          </h1>
          <button
            type="button"
            onClick={() => setSampleOpen(true)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            리포트 샘플
          </button>
        </div>

        <p className="mt-5 max-w-4xl text-sm leading-relaxed text-slate-600">
          기업, 제품, 부품 정보 입력 후 관련 서류까지 업로드를 완료하면 AI가 유럽의 PPWR기준에 따라
          심사한 뒤 수출 적합 여부를 알려드려요.
          <br />
          모든 내용이 채워지지 않아도 걱정마세요. 적합 판정을 받기 위해 어떤 보완 사항이 필요한지도
          알려드립니다.
        </p>

        {/* 스테퍼 + 취소/저장 */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Stepper current={step} onJump={setStep} />
          {step > 1 && (
            <div className="flex gap-2">
              <Link
                href="/app/diagnosis"
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                취소
              </Link>
              <button
                type="button"
                className="rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-soft"
              >
                저장
              </button>
            </div>
          )}
        </div>

        {/* 본문 — 1·2단계는 우측 AI 도우미와 2단 구성 */}
        <div
          className={
            "mt-5 " + (step === 3 ? "" : "grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]")
          }
        >
          {step === 1 && (
            <StepIdentity
              value={identity}
              onChange={(patch) => setIdentity((prev) => ({ ...prev, ...patch }))}
              mandateFiles={mandateFiles}
              onMandateFilesChange={setMandateFiles}
            />
          )}
          {step === 2 && <StepProduct productId={productId} onSelectProduct={setProductId} />}
          {step === 3 && <StepRun agreed={agreed} onAgree={setAgreed} />}
          {step !== 3 && <AiAssistant />}
        </div>

        {run.error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-danger">
            {(run.error as Error).message}
          </p>
        )}

        {/* 하단 네비게이션 */}
        <div className="mt-6 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as StepNo)}
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              이전
            </button>
          ) : (
            <span />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as StepNo)}
              disabled={step === 2 && productId == null}
              className="inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-ink-soft disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              다음 <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => run.mutate()}
              disabled={!agreed || productId == null || run.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-ink-soft disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {run.isPending ? "진단 시작 중…" : "진단 진행"} <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {step === 1 && missingIdentity > 0 && (
          <p className="mt-3 text-right text-xs text-slate-400">
            필수 입력 {missingIdentity}건이 남아 있습니다. 채우지 않아도 진행할 수 있어요.
          </p>
        )}
      </div>

      <ReportSampleModal open={sampleOpen} onClose={() => setSampleOpen(false)} />
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="px-8 py-10 text-sm text-slate-400">불러오는 중…</div>}>
      <DiagnosisWizard />
    </Suspense>
  );
}
