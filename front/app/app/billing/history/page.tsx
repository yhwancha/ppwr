"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, Receipt, Repeat, XCircle } from "lucide-react";
import Topbar from "@/components/app/Topbar";
import { formatKRW } from "@/src/shared/payments/config";
import {
  cancelSubscription,
  listOrders,
  listSubscriptions,
  type OrderRecord,
  type SubscriptionRecord,
} from "@/src/shared/payments/store";

export default function HistoryPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [subs, setSubs] = useState<SubscriptionRecord[]>([]);

  const refresh = useCallback(() => {
    setOrders(listOrders());
    setSubs(listSubscriptions());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("ppwr:payments-updated", refresh);
    return () => window.removeEventListener("ppwr:payments-updated", refresh);
  }, [refresh]);

  function onCancel(id: string) {
    if (confirm("정기결제를 해지하시겠습니까? 다음 결제일부터 청구되지 않습니다.")) {
      cancelSubscription(id);
      refresh();
    }
  }

  return (
    <>
      <Topbar crumbs={[{ label: "결제·구독", href: "/app/billing" }, { label: "내역" }]} />
      <div className="mx-auto max-w-4xl px-8 pb-24">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-ink">결제·구독 내역</h1>
          <Link
            href="/app/billing"
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            요금제
          </Link>
        </div>

        {/* 구독 관리 */}
        <section className="mt-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <Repeat className="h-4 w-4" /> 정기 구독
          </h2>
          {subs.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400">
              진행 중인 구독이 없습니다.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {subs.map((s) => {
                const active = s.status === "active";
                return (
                  <div
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-ink">{s.productName}</h3>
                        <span
                          className={
                            "rounded-md px-2 py-0.5 text-[11px] font-semibold " +
                            (active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-400")
                          }
                        >
                          {active ? "구독중" : "해지됨"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatKRW(s.amount)} / 월 ·{" "}
                        {active
                          ? `다음 결제 ${new Date(s.nextBillingAt).toLocaleDateString("ko-KR")}`
                          : `해지일 ${s.canceledAt ? new Date(s.canceledAt).toLocaleDateString("ko-KR") : "-"}`}
                      </p>
                    </div>
                    {active && (
                      <button
                        onClick={() => onCancel(s.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-danger hover:text-danger"
                      >
                        <XCircle className="h-4 w-4" /> 구독 해지
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 결제 내역 */}
        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <Receipt className="h-4 w-4" /> 결제 내역
          </h2>
          {orders.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400">
              결제 내역이 없습니다.{" "}
              <Link href="/app/billing" className="font-semibold text-primary underline">
                요금제 보기
              </Link>
            </p>
          ) : (
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="px-5 py-3">일시</th>
                    <th className="px-5 py-3">상품</th>
                    <th className="px-5 py-3">방식</th>
                    <th className="px-5 py-3 text-right">금액</th>
                    <th className="px-5 py-3 text-right">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((o) => (
                    <tr key={o.paymentId}>
                      <td className="px-5 py-3 text-slate-500">
                        {new Date(o.createdAt).toLocaleString("ko-KR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-5 py-3 font-semibold text-ink">{o.productName}</td>
                      <td className="px-5 py-3 text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          {o.type === "subscription" ? (
                            <Repeat className="h-3.5 w-3.5" />
                          ) : (
                            <CreditCard className="h-3.5 w-3.5" />
                          )}
                          {o.type === "subscription" ? "정기결제" : "일반결제"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-ink">
                        {formatKRW(o.amount)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                          결제완료
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="mt-6 text-xs text-slate-400">
          * 본 내역은 데모 저장소(브라우저) 기준으로 표시됩니다. 실제 결제 상태는 포트원 콘솔과 서버 검증을 기준으로 합니다.
        </p>
      </div>
    </>
  );
}
