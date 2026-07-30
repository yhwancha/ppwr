import Link from "next/link";
import { Check, CreditCard, Receipt, Repeat, ShieldCheck } from "lucide-react";
import Topbar from "@/components/app/Topbar";
import {
  PRODUCTS,
  formatKRW,
  isPortOneConfigured,
} from "@/src/shared/payments/config";

export const metadata = { title: "결제·구독 – PPWR AI" };

export default function BillingPage() {
  const configured = isPortOneConfigured();

  return (
    <>
      <Topbar crumbs={[{ label: "결제·구독" }]} />
      <div className="px-8 pb-24">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-ink">결제·구독</h1>
            <p className="mt-1 text-sm text-slate-500">
              단건 셀프진단권과 매니지드 정기구독을 결제합니다. 결제는 포트원(PortOne)으로 안전하게 처리됩니다.
            </p>
          </div>
          <Link
            href="/app/billing/history"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Receipt className="h-4 w-4" /> 결제·구독 내역
          </Link>
        </div>

        {!configured && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            <b>결제 키 미설정</b> — 환경변수{" "}
            <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_PORTONE_STORE_ID</code>,{" "}
            <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_PORTONE_CHANNEL_KEY</code>{" "}
            를 설정하면 실제 결제창이 열립니다. (심사는 test 채널로 진행)
          </div>
        )}

        {/* 요금제 카드 */}
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {PRODUCTS.map((p) => (
            <div
              key={p.id}
              className={
                "relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm " +
                (p.highlight ? "border-primary ring-1 ring-primary/30" : "border-slate-200")
              }
            >
              {p.highlight && (
                <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-white">
                  추천
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
                  {p.type === "subscription" ? (
                    <Repeat className="h-3 w-3" />
                  ) : (
                    <CreditCard className="h-3 w-3" />
                  )}
                  {p.badge}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-extrabold text-ink">{p.name}</h3>
              <p className="mt-1 min-h-[40px] text-sm text-slate-500">{p.tagline}</p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-black text-ink">{formatKRW(p.price)}</span>
                <span className="text-sm font-semibold text-slate-400">/ {p.unit}</span>
              </div>

              <ul className="mt-5 flex-1 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={`/app/billing/checkout?product=${p.id}`}
                className={
                  "mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors " +
                  (p.highlight
                    ? "bg-primary text-white hover:bg-primary-dark"
                    : "bg-primary-soft text-primary hover:bg-primary-light/50")
                }
              >
                {p.type === "subscription" ? "구독하기" : "결제하기"}
              </Link>
            </div>
          ))}
        </div>

        {/* 안내 */}
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p>
            모든 결제는 카드 정보가 당사 서버에 저장되지 않으며 포트원(PG)을 통해 처리됩니다. 정기구독은 언제든{" "}
            <Link href="/app/billing/history" className="font-semibold text-primary underline">
              결제·구독 내역
            </Link>{" "}
            에서 해지할 수 있습니다. 취소·환불 규정은{" "}
            <Link href="/refund" className="font-semibold text-primary underline">
              환불정책
            </Link>{" "}
            을 참고하세요.
          </p>
        </div>
      </div>
    </>
  );
}
