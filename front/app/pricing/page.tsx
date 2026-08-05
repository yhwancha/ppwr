import Link from "next/link";
import {
  Check,
  CreditCard,
  Repeat,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { PRODUCTS, formatKRW, MERCHANT } from "@/src/shared/payments/config";

export const metadata = {
  title: "요금제 – PPWR AI",
  description:
    "PPWR AI 셀프진단권(단건)과 매니지드 정기구독 요금제. 신용카드 결제·정기결제 지원.",
};

export default function PricingPage() {
  // 공개 페이지에는 심사용 테스트 상품은 노출하지 않는다.
  const plans = PRODUCTS.filter((p) => !p.id.startsWith("review-"));

  return (
    <div className="bg-slate-50">
      {/* Hero */}
      <section className="bg-ink text-white">
        <div className="mx-auto w-full max-w-5xl px-6 py-20 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-primary-light">
            <Sparkles className="h-3.5 w-3.5" /> PPWR AI 요금제
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight md:text-5xl">
            필요한 만큼, 합리적으로
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            제품 1건만 빠르게 진단하는 단건 이용권부터, 매월 진단과 전문가 지원을 받는
            정기구독까지. 모든 결제는 포트원(PortOne)으로 안전하게 처리됩니다.
          </p>
        </div>
      </section>

      {/* 요금제 카드 */}
      <section className="mx-auto -mt-12 w-full max-w-6xl px-6 pb-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.id}
              className={
                "relative flex flex-col rounded-2xl border bg-white p-7 shadow-sm " +
                (p.highlight
                  ? "border-primary shadow-lg ring-1 ring-primary/20"
                  : "border-slate-200")
              }
            >
              {p.highlight && (
                <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-white">
                  가장 인기
                </span>
              )}
              <span className="inline-flex w-fit items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
                {p.type === "subscription" ? (
                  <Repeat className="h-3 w-3" />
                ) : (
                  <CreditCard className="h-3 w-3" />
                )}
                {p.badge}
              </span>

              <h2 className="mt-4 text-xl font-extrabold text-ink">{p.name}</h2>
              <p className="mt-1.5 min-h-[44px] text-sm text-slate-500">{p.tagline}</p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-black text-ink">{formatKRW(p.price)}</span>
                <span className="text-sm font-semibold text-slate-400">/ {p.unit}</span>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={`/app/billing/checkout?product=${p.id}`}
                className={
                  "mt-7 inline-flex items-center justify-center rounded-xl px-5 py-3.5 text-sm font-bold transition-colors " +
                  (p.highlight
                    ? "bg-primary text-white hover:bg-primary-dark"
                    : "bg-primary-soft text-primary hover:bg-primary-light/50")
                }
              >
                {p.type === "subscription" ? "구독 시작하기" : "결제하고 진단하기"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 결제 안내 */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-8 sm:grid-cols-3">
          <Info
            icon={<CreditCard className="h-5 w-5 text-primary" />}
            title="결제 수단"
            desc="신용·체크카드 결제 및 카드 정기결제(빌링)를 지원합니다."
          />
          <Info
            icon={<ShieldCheck className="h-5 w-5 text-primary" />}
            title="안전한 결제"
            desc="카드 정보는 당사에 저장되지 않으며 포트원(PG)이 처리합니다."
          />
          <Info
            icon={<Repeat className="h-5 w-5 text-primary" />}
            title="자유로운 해지"
            desc="정기구독은 언제든 해지 가능하며, 취소·환불 규정을 따릅니다."
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
        <h3 className="font-bold text-ink">{title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-slate-500">{desc}</p>
    </div>
  );
}
