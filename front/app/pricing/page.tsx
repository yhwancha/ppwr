import Link from "next/link";
import { Check, CreditCard, Repeat, ShieldCheck, Sparkles } from "lucide-react";
import { SUBSCRIPTION_TIERS, MERCHANT } from "@/src/shared/payments/config";
import TierCta from "@/components/pricing/TierCta";

export const metadata = {
  title: "요금제 – PPWR AI",
  description:
    "PPWR AI 구독 요금제 — 무료형·기본형·성장형·기업형. SKU 규모에 맞춰 선택하세요.",
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
          <h1 className="mt-6 text-4xl font-extrabold leading-tight md:text-5xl">
            필요한 만큼, 합리적으로
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            관리 SKU 규모에 맞춰 요금제를 선택하세요. 무료형은 구독료 없이 필요한
            서비스만 건별로 이용할 수 있습니다.
          </p>
        </div>
      </section>

      {/* ── 구독 요금제 ── */}
      <section className="mx-auto w-full max-w-6xl px-6 pt-16">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Plans
          </span>
          <h2 className="mt-3 text-3xl font-extrabold text-ink">구독 요금제</h2>
          <p className="mt-2 text-sm text-slate-500">
            구독 상품은 매월 자동 결제되며 언제든 해지할 수 있습니다.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {SUBSCRIPTION_TIERS.map((t) => (
            <div
              key={t.id}
              className={
                "relative flex flex-col rounded-2xl border bg-white p-6 " +
                (t.highlight
                  ? "border-primary shadow-lg ring-1 ring-primary/20"
                  : "border-slate-200 shadow-sm")
              }
            >
              {t.highlight && (
                <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-white">
                  추천
                </span>
              )}
              <h3 className="text-lg font-extrabold text-ink">{t.name}</h3>
              <p className="mt-1 min-h-[52px] text-xs leading-relaxed text-slate-500">
                {t.audience}
              </p>

              <div className="mt-3">
                <span className="text-2xl font-black text-ink">{t.priceLabel}</span>
                <p className="mt-1 text-xs text-slate-400">{t.priceSub}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                <Tag>{t.sku}</Tag>
                <Tag>{t.accounts}</Tag>
              </div>

              <ul className="mt-4 flex-1 space-y-2 border-t border-slate-100 pt-4">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>

              <TierCta label={t.cta.label} href={t.cta.href} highlight={t.highlight} />
            </div>
          ))}
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-slate-400">
          무료형 가입 후, 필요한 서비스(PPWR AI 진단·TD·DoC 등)는 건별 단가로 결제할 수 있습니다.
        </p>
      </section>

      {/* 결제 안내 */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
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

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
      {children}
    </span>
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
