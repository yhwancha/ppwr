"use client";

import Link from "next/link";
import { Boxes, Check, CreditCard } from "lucide-react";
import {
  SUBSCRIPTION_TIERS,
  SERVICE_ITEMS,
  PACKAGES,
  REVIEW_ACCOUNT_EMAIL,
  SUBSCRIPTION_ENABLED,
  getProduct,
  formatKRW,
  type Product,
} from "@/src/shared/payments/config";
import { useSession } from "@/src/features/auth/session";
import TierCta from "@/components/pricing/TierCta";

const REVIEW = getProduct("review-test-100");

/**
 * 구독 요금제 그리드.
 * PG 실결제 심사용 계정(test@test.com)으로 로그인한 경우엔 전체 카탈로그 대신
 * 심사용 상품(review-test-100)만 노출한다. (billing 화면과 동일한 처리)
 * 카드사 심사 대상 화면이므로 '테스트/심사용' 같은 문구가 드러나선 안 된다.
 * 로그아웃 상태의 일반 방문자·PG는 정상 카탈로그를 그대로 본다.
 */
export default function PricingPlans() {
  const { user } = useSession();
  const isReviewer = user?.email === REVIEW_ACCOUNT_EMAIL;

  if (isReviewer) {
    const reviewProducts = [REVIEW].filter(Boolean) as NonNullable<
      typeof REVIEW
    >[];
    return (
      <div className="mx-auto mt-10 max-w-md">
        <div className="grid gap-5">
          {reviewProducts.map((p) => (
            <ReviewCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    );
  }

  // 정기결제 비활성화(일반결제만): 구독 요금제 대신 건별 서비스 단가를 노출한다.
  if (!SUBSCRIPTION_ENABLED) {
    const items = [...SERVICE_ITEMS, ...PACKAGES];
    return (
      <>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {items.map((p) => (
            <PlanProductCard key={p.id} p={p} />
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-slate-400">
          가입은 무료입니다. 필요한 서비스만 건별 단가로 결제하며, 별도 약정·정기결제가 없습니다.
        </p>
      </>
    );
  }

  return (
    <>
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
              <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-white">
                추천
              </span>
            )}
            <h3 className="text-lg font-semibold text-ink">{t.name}</h3>
            <p className="mt-1 min-h-[52px] text-xs leading-relaxed text-slate-500">
              {t.audience}
            </p>

            <div className="mt-3">
              <span className="text-2xl font-semibold text-ink">{t.priceLabel}</span>
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
    </>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
      {children}
    </span>
  );
}

/** 건별(단건) 서비스·패키지 상품 카드 (정기결제 비활성 시 요금제 그리드). */
function PlanProductCard({ p }: { p: Product }) {
  const isPkg = p.id.startsWith("pkg-");
  const discounted = p.listPrice && p.listPrice > p.price;
  const Icon = isPkg ? Boxes : CreditCard;
  return (
    <div
      className={
        "relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm " +
        (p.highlight ? "border-primary ring-1 ring-primary/30" : "border-slate-200")
      }
    >
      {p.highlight && (
        <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-white">
          추천
        </span>
      )}
      <span className="inline-flex w-fit items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
        <Icon className="h-3 w-3" /> {p.badge}
      </span>
      <h3 className="mt-3 text-base font-semibold text-ink">{p.name}</h3>
      <p className="mt-1 min-h-[40px] text-xs leading-relaxed text-slate-500">{p.tagline}</p>

      <div className="mt-3">
        {discounted && (
          <span className="mr-1.5 text-xs font-medium text-slate-400 line-through">
            {formatKRW(p.listPrice!)}
          </span>
        )}
        <span className="text-2xl font-semibold text-ink">{formatKRW(p.price)}</span>
        <span className="ml-1 text-xs font-semibold text-slate-400">/ {p.unit}</span>
      </div>
      {p.priceNote && <p className="mt-1 text-[11px] text-slate-400">{p.priceNote}</p>}

      <ul className="mt-4 flex-1 space-y-2 border-t border-slate-100 pt-4">
        {p.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            {f}
          </li>
        ))}
      </ul>

      <Link
        href={`/app/billing/checkout?product=${p.id}`}
        className={
          "mt-5 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors " +
          (p.highlight
            ? "bg-primary text-white hover:bg-primary-dark"
            : "bg-primary-soft text-primary hover:bg-primary-light/50")
        }
      >
        결제하기
      </Link>
    </div>
  );
}

function ReviewCard({ p }: { p: NonNullable<ReturnType<typeof getProduct>> }) {
  return (
    <div className="relative flex flex-col rounded-2xl border border-primary bg-white p-6 shadow-lg ring-1 ring-primary/20">
      <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-white">
        {p.badge ?? "건별 결제"}
      </span>
      <h3 className="text-lg font-semibold text-ink">{p.name}</h3>
      <p className="mt-1 min-h-[52px] text-xs leading-relaxed text-slate-500">
        {p.tagline}
      </p>

      <div className="mt-3">
        <span className="text-2xl font-semibold text-ink">{formatKRW(p.price)}</span>
        <span className="ml-1 text-xs font-semibold text-slate-400">/ {p.unit}</span>
      </div>

      <ul className="mt-4 flex-1 space-y-2 border-t border-slate-100 pt-4">
        {p.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            {f}
          </li>
        ))}
      </ul>

      <Link
        href="/app/billing"
        className="mt-5 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
      >
        결제하기
      </Link>
    </div>
  );
}
