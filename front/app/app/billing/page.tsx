"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Boxes,
  Check,
  CreditCard,
  Receipt,
  Repeat,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Topbar from "@/components/app/Topbar";
import {
  PRODUCTS,
  SERVICE_ITEMS,
  PACKAGES,
  getProduct,
  formatKRW,
  isPortOneConfigured,
  REVIEW_ACCOUNT_EMAIL,
  type Product,
} from "@/src/shared/payments/config";
import {
  listSubscriptions,
  type SubscriptionRecord,
} from "@/src/shared/payments/store";
import { useSession } from "@/src/features/auth/session";

const SUB_PLANS = PRODUCTS.filter((p) => p.type === "subscription");
const REVIEW = getProduct("review-test-100");

export default function BillingPage() {
  const configured = isPortOneConfigured();
  const [subs, setSubs] = useState<SubscriptionRecord[]>([]);

  useEffect(() => {
    const refresh = () => setSubs(listSubscriptions());
    refresh();
    window.addEventListener("ppwr:payments-updated", refresh);
    return () => window.removeEventListener("ppwr:payments-updated", refresh);
  }, []);

  const active = subs.find((s) => s.status === "active");
  const { user } = useSession();
  const isReviewer = user?.email === REVIEW_ACCOUNT_EMAIL;

  // ── PG 실결제 심사용 계정: 심사용 100원 상품만 노출 ──
  if (isReviewer) {
    return (
      <>
        <Topbar crumbs={[{ label: "결제·구독" }]} />
        <div className="mx-auto max-w-md px-8 pb-24">
          <div>
            <h1 className="text-2xl font-semibold text-ink">결제</h1>
            <p className="mt-1 text-sm text-slate-500">
              결제 flow 확인용 화면입니다. 아래 상품으로 결제 후 취소·환불을 진행하세요.
            </p>
          </div>

          {!configured && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
              <span className="font-semibold">결제 키 미설정</span> — 결제창을 열려면 관리자에게 문의하세요.
            </div>
          )}

          <div className="mt-6">{REVIEW && <ProductCard p={REVIEW} />}</div>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p>
              모든 결제는 카드 정보가 당사 서버에 저장되지 않으며 포트원(PG)을 통해 처리됩니다.
              취소·환불 규정은{" "}
              <Link href="/refund" className="font-semibold text-primary underline">
                환불정책
              </Link>
              을 따릅니다.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar crumbs={[{ label: "결제·구독" }]} />
      <div className="px-8 pb-24">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-ink">결제·구독</h1>
            <p className="mt-1 text-sm text-slate-500">현재 플랜과 결제를 관리합니다.</p>
          </div>
          <Link
            href="/app/billing/history"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Receipt className="h-4 w-4" /> 결제·구독 내역
          </Link>
        </div>

        {/* 현재 플랜 배너 */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-400">현재 플랜</p>
              <p className="font-semibold text-ink">
                {active ? active.productName : "무료형"}
                {active && (
                  <span className="ml-2 text-xs font-semibold text-slate-400">
                    다음 결제 {new Date(active.nextBillingAt).toLocaleDateString("ko-KR")}
                  </span>
                )}
              </p>
            </div>
          </div>
          {!active && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
              구독료 0원 · 필요한 서비스만 건별 결제
            </span>
          )}
        </div>

        {!configured && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            <span className="font-semibold">결제 키 미설정</span>. 환경변수{" "}
            <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_PORTONE_STORE_ID</code>,{" "}
            <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_PORTONE_CHANNEL_KEY</code>{" "}
            를 설정하면 실제 결제창이 열립니다. (심사는 test 채널로 진행)
          </div>
        )}

        {active ? (
          /* ── 구독 중 ── */
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2">
              <Repeat className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-ink">구독 이용 중</h2>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              <span className="font-semibold text-slate-700">{active.productName}</span> · 월 {formatKRW(active.amount)}
              {" "}등록 SKU 내 진단·문서 발행이 포함됩니다. 별도 건별 결제 없이 이용하세요.
            </p>
            <Link
              href="/app/billing/history"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              구독 관리·해지
            </Link>
          </div>
        ) : (
          /* ── 무료형 ── */
          <>
            <Section
              title="구독으로 업그레이드"
              desc="SKU를 지속 관리한다면 월 구독이 더 유리합니다."
            >
              {SUB_PLANS.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </Section>

            <Section
              title="건별 서비스 단가"
              desc="구독 없이, 필요한 서비스만 건별로 결제합니다."
            >
              {SERVICE_ITEMS.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
              {REVIEW && <ProductCard p={REVIEW} />}
            </Section>

            <Section
              title="미구독 고객 패키지"
              desc="여러 서비스를 묶어(등록 대행 포함) 합리적으로 이용합니다."
            >
              {PACKAGES.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </Section>
          </>
        )}

        {/* 안내 */}
        <div className="mt-10 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p>
            모든 결제는 카드 정보가 당사 서버에 저장되지 않으며 포트원(PG)을 통해 처리됩니다.
            정기구독은{" "}
            <Link href="/app/billing/history" className="font-semibold text-primary underline">
              결제·구독 내역
            </Link>
            에서 언제든 해지할 수 있고, 취소·환불 규정은{" "}
            <Link href="/refund" className="font-semibold text-primary underline">
              환불정책
            </Link>
            을 따릅니다.
          </p>
        </div>
      </div>
    </>
  );
}

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-0.5 text-sm text-slate-500">{desc}</p>
      <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-4">{children}</div>
    </section>
  );
}

function ProductCard({ p }: { p: Product }) {
  const isSub = p.type === "subscription";
  const isPkg = p.id.startsWith("pkg-");
  const discounted = p.listPrice && p.listPrice > p.price;
  const Icon = isSub ? Repeat : isPkg ? Boxes : CreditCard;

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
        {isSub ? "구독하기" : "결제하기"}
      </Link>
    </div>
  );
}
