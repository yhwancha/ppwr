"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard, Lock, Repeat, ShieldCheck } from "lucide-react";
import Topbar from "@/components/app/Topbar";
import { useSession } from "@/src/features/auth/session";
import {
  MERCHANT,
  formatKRW,
  getProduct,
  isPortOneConfigured,
} from "@/src/shared/payments/config";
import {
  newPaymentId,
  requestBillingKey,
  requestOneTimePayment,
  type Buyer,
} from "@/src/shared/payments/checkout";

const PENDING_KEY = "ppwr.pending";

function CheckoutInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useSession();
  const product = getProduct(params.get("product") ?? "");
  const configured = isPortOneConfigured();

  const [buyer, setBuyer] = useState<Buyer>({ name: "", email: "", phone: "" });
  const [agree, setAgree] = useState({ terms: false, privacy: false, recurring: false });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) setBuyer((b) => (b.email ? b : { ...b, email: user.email! }));
  }, [user]);

  const isSub = product?.type === "subscription";
  const requiredOk = useMemo(
    () => agree.terms && agree.privacy && (!isSub || agree.recurring),
    [agree, isSub],
  );
  const canPay = configured && requiredOk && buyer.name.trim() && buyer.email.trim() && !loading;

  if (!product) {
    return (
      <>
        <Topbar crumbs={[{ label: "결제·구독", href: "/app/billing" }, { label: "주문" }]} />
        <div className="p-8">
          <p className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-danger">
            상품을 찾을 수 없습니다.{" "}
            <Link href="/app/billing" className="font-semibold underline">요금제로 돌아가기</Link>
          </p>
        </div>
      </>
    );
  }

  async function pay() {
    if (!product || !canPay) return;
    setErr(null);
    setLoading(true);
    const paymentId = newPaymentId(isSub ? "sub" : "pay");
    try {
      // 완료 페이지에서 검증·기록할 수 있도록 주문 맥락을 저장
      sessionStorage.setItem(
        PENDING_KEY,
        JSON.stringify({ paymentId, productId: product.id, type: product.type, buyer }),
      );

      if (isSub) {
        const { billingKey } = await requestBillingKey(product, buyer, paymentId);
        sessionStorage.setItem(
          PENDING_KEY,
          JSON.stringify({ paymentId, productId: product.id, type: product.type, buyer, billingKey }),
        );
        router.push(
          `/app/billing/complete?type=subscription&productId=${product.id}&paymentId=${paymentId}&billingKey=${encodeURIComponent(billingKey)}`,
        );
      } else {
        const { paymentId: pid } = await requestOneTimePayment(product, buyer, paymentId);
        router.push(`/app/billing/complete?type=onetime&productId=${product.id}&paymentId=${pid}`);
      }
    } catch (e) {
      setErr((e as Error).message);
      setLoading(false);
    }
  }

  return (
    <>
      <Topbar crumbs={[{ label: "결제·구독", href: "/app/billing" }, { label: "주문·결제" }]} />
      <div className="mx-auto max-w-5xl px-8 pb-24">
        <h1 className="text-2xl font-semibold text-ink">주문·결제</h1>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* 좌: 주문자 정보 + 약관 */}
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-base font-semibold text-ink">주문자 정보</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-600">이름 *</span>
                  <input
                    value={buyer.name}
                    onChange={(e) => setBuyer({ ...buyer, name: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                    placeholder="홍길동"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-600">이메일 *</span>
                  <input
                    value={buyer.email}
                    onChange={(e) => setBuyer({ ...buyer, email: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                    placeholder="name@company.com"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-semibold text-slate-600">휴대폰 (선택)</span>
                  <input
                    value={buyer.phone}
                    onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                    placeholder="010-0000-0000"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-base font-semibold text-ink">약관 동의</h2>
              <div className="mt-4 space-y-3">
                <Consent
                  checked={agree.terms}
                  onChange={(v) => setAgree({ ...agree, terms: v })}
                  label="(필수) 구매조건 및 결제진행에 동의합니다."
                  href="/terms"
                />
                <Consent
                  checked={agree.privacy}
                  onChange={(v) => setAgree({ ...agree, privacy: v })}
                  label="(필수) 개인정보 수집·이용에 동의합니다."
                  href="/privacy"
                />
                {isSub && (
                  <Consent
                    checked={agree.recurring}
                    onChange={(v) => setAgree({ ...agree, recurring: v })}
                    label="(필수) 매월 자동 정기결제 및 청약철회·해지 조건에 동의합니다."
                    href="/refund"
                  />
                )}
              </div>
            </section>
          </div>

          {/* 우: 주문 요약 */}
          <aside className="lg:sticky lg:top-24 h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              {isSub ? <Repeat className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
              {product.badge}
            </div>
            <h3 className="text-lg font-semibold text-ink">{product.name}</h3>
            <p className="text-sm text-slate-500">{product.tagline}</p>

            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">상품 금액</span>
                <span className="font-semibold text-ink">{formatKRW(product.price)}</span>
              </div>
              {isSub && (
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-slate-500">결제 주기</span>
                  <span className="font-semibold text-ink">매월</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="font-semibold text-ink">
                {isSub ? "첫 결제 금액" : "총 결제 금액"}
              </span>
              <span className="text-xl font-semibold text-primary">{formatKRW(product.price)}</span>
            </div>

            {err && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-danger">
                {err}
              </p>
            )}

            <button
              onClick={pay}
              disabled={!canPay}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Lock className="h-4 w-4" />
              {loading
                ? "결제창 여는 중…"
                : isSub
                  ? `${formatKRW(product.price)} 구독 시작`
                  : `${formatKRW(product.price)} 결제하기`}
            </button>

            <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5" /> 포트원(PortOne) 보안 결제 · 카드정보 미저장
            </p>
            <p className="text-[11px] leading-relaxed text-slate-400">
              판매자: {MERCHANT.companyName} · 통신판매업 {MERCHANT.mailOrderNo}
            </p>
          </aside>
        </div>
      </div>
    </>
  );
}

function Consent({
  checked,
  onChange,
  label,
  href,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  href: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="flex flex-1 items-start gap-2.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
        />
        <span className="text-sm text-slate-600">{label}</span>
      </label>
      <Link
        href={href}
        target="_blank"
        className="shrink-0 text-xs font-semibold text-slate-400 underline hover:text-primary"
      >
        보기
      </Link>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-400">불러오는 중…</div>}>
      <CheckoutInner />
    </Suspense>
  );
}
