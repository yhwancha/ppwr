import Link from "next/link";
import { CreditCard, Repeat, ShieldCheck, Sparkles } from "lucide-react";
import { MERCHANT, SUBSCRIPTION_ENABLED } from "@/src/shared/payments/config";
import PricingPlans from "@/components/pricing/PricingPlans";

export const metadata = {
  title: "요금제 – PPWR AI",
  description: SUBSCRIPTION_ENABLED
    ? "PPWR AI 구독 요금제 — 무료형·기본형·성장형·기업형. SKU 규모에 맞춰 선택하세요."
    : "PPWR AI 요금제 — 필요한 서비스(AI 진단·TD·DoC)를 건별 단가로 결제하세요.",
};

export default function PricingPage() {
  return (
    <div className="bg-slate-50">
      {/* Hero */}
      <section className="bg-ink text-white">
        <div className="mx-auto w-full max-w-5xl px-6 py-20 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-primary-light">
            <Sparkles className="h-3.5 w-3.5" /> PPWR AI 요금제
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-tight md:text-5xl">
            필요한 만큼, 합리적으로
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            {SUBSCRIPTION_ENABLED
              ? "관리 SKU 규모에 맞춰 요금제를 선택하세요. 무료형은 구독료 없이 필요한 서비스만 건별로 이용할 수 있습니다."
              : "가입은 무료입니다. 필요한 서비스(AI 진단·TD·DoC)만 건별 단가로 결제하세요."}
          </p>
        </div>
      </section>

      {/* ── 요금제 ── */}
      <section className="mx-auto w-full max-w-6xl px-6 pt-16">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Plans
          </span>
          <h2 className="mt-3 text-3xl font-semibold text-ink">
            {SUBSCRIPTION_ENABLED ? "구독 요금제" : "서비스 요금"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {SUBSCRIPTION_ENABLED
              ? "구독 상품은 매월 자동 결제되며 언제든 해지할 수 있습니다."
              : "필요한 서비스만 건별 단가로 결제합니다. 별도 약정·정기결제가 없습니다."}
          </p>
        </div>

        <PricingPlans />
      </section>

      {/* 결제 안내 */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-8 sm:grid-cols-3">
          <Info
            icon={<CreditCard className="h-5 w-5 text-primary" />}
            title="결제 수단"
            desc={
              SUBSCRIPTION_ENABLED
                ? "신용·체크카드 결제 및 카드 정기결제(빌링)를 지원합니다."
                : "신용·체크카드 결제를 지원합니다."
            }
          />
          <Info
            icon={<ShieldCheck className="h-5 w-5 text-primary" />}
            title="안전한 결제"
            desc="카드 정보는 당사에 저장되지 않으며 포트원(PG)이 처리합니다."
          />
          <Info
            icon={<Repeat className="h-5 w-5 text-primary" />}
            title={SUBSCRIPTION_ENABLED ? "자유로운 해지" : "안심 취소·환불"}
            desc={
              SUBSCRIPTION_ENABLED
                ? "정기구독은 언제든 해지 가능하며, 취소·환불 규정을 따릅니다."
                : "결제 후 취소·환불은 취소·환불 규정에 따라 처리됩니다."
            }
          />
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          결제 전{" "}
          <Link href="/terms" className="font-semibold text-primary underline">
            이용약관
          </Link>
          ,{" "}
          <Link href="/refund" className="font-semibold text-primary underline">
            취소·환불 규정
          </Link>{" "}
          을 확인해 주세요. · 판매자: {MERCHANT.companyName}
        </p>
      </section>
    </div>
  );
}

function Info({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft">
          {icon}
        </span>
        <h3 className="font-semibold text-ink">{title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-slate-500">{desc}</p>
    </div>
  );
}
