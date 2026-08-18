"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, Receipt, XCircle } from "lucide-react";
import Topbar from "@/components/app/Topbar";
import { formatKRW, getProduct } from "@/src/shared/payments/config";
import {
  nextMonthISO,
  upsertOrder,
  upsertSubscription,
} from "@/src/shared/payments/store";
import { BASE_PATH } from "@/src/shared/base-path";

const PENDING_KEY = "ppwr.pending";

type Result = {
  ok: boolean;
  status: string;
  paymentId: string;
  productName: string;
  amount: number;
  method?: string;
  type: "onetime" | "subscription";
  nextBillingAt?: string;
  message?: string;
};

function CompleteInner() {
  const params = useSearchParams();
  const ran = useRef(false);
  const [state, setState] = useState<"verifying" | "done">("verifying");
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const type = (params.get("type") as "onetime" | "subscription") ?? "onetime";
    const productId = params.get("productId") ?? "";
    const paymentId = params.get("paymentId") ?? "";
    const code = params.get("code"); // PortOne 실패/취소 시 존재
    const message = params.get("message");

    const pendingRaw =
      typeof window !== "undefined" ? sessionStorage.getItem(PENDING_KEY) : null;
    const pending = pendingRaw ? JSON.parse(pendingRaw) : {};
    const buyer = pending.buyer ?? { name: "", email: "" };
    const billingKey = params.get("billingKey") ?? pending.billingKey;
    const product = getProduct(productId);

    async function run() {
      // 결제창에서 실패/취소된 경우
      if (code) {
        finish({
          ok: false,
          status: "FAILED",
          paymentId,
          productName: product?.name ?? "",
          amount: product?.price ?? 0,
          type,
          message: message ?? "결제가 취소되었습니다.",
        });
        return;
      }

      try {
        if (type === "subscription") {
          const res = await fetch(`${BASE_PATH}/api/billing/charge`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ billingKey, productId, paymentId, buyer }),
          }).then((r) => r.json());

          if (res.ok) {
            const nextBillingAt = nextMonthISO();
            upsertSubscription({
              id: paymentId,
              productId,
              productName: res.productName,
              amount: res.amount,
              billingKey,
              status: "active",
              startedAt: new Date().toISOString(),
              nextBillingAt,
            });
            recordOrder(res, "subscription", buyer);
            finish({ ...toResult(res, "subscription"), nextBillingAt });
          } else {
            finish({ ...toResult(res, "subscription"), ok: false });
          }
        } else {
          const res = await fetch(`${BASE_PATH}/api/payment/complete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId, productId }),
          }).then((r) => r.json());

          if (res.ok) recordOrder(res, "onetime", buyer);
          finish(toResult(res, "onetime"));
        }
      } catch (e) {
        finish({
          ok: false,
          status: "FAILED",
          paymentId,
          productName: product?.name ?? "",
          amount: product?.price ?? 0,
          type,
          message: (e as Error).message,
        });
      } finally {
        if (typeof window !== "undefined") sessionStorage.removeItem(PENDING_KEY);
      }
    }

    function recordOrder(
      res: { paymentId: string; productId: string; productName: string; amount: number; status: string; method?: string },
      t: "onetime" | "subscription",
      b: { name: string; email: string },
    ) {
      upsertOrder({
        paymentId: res.paymentId,
        productId: res.productId,
        productName: res.productName,
        type: t,
        amount: res.amount,
        status: "PAID",
        method: res.method,
        buyerName: b.name,
        buyerEmail: b.email,
        createdAt: new Date().toISOString(),
      });
    }

    function toResult(
      res: { ok?: boolean; status?: string; paymentId?: string; productName?: string; amount?: number; method?: string; message?: string },
      t: "onetime" | "subscription",
    ): Result {
      return {
        ok: !!res.ok,
        status: res.status ?? (res.ok ? "PAID" : "FAILED"),
        paymentId: res.paymentId ?? paymentId,
        productName: res.productName ?? product?.name ?? "",
        amount: res.amount ?? product?.price ?? 0,
        method: res.method,
        type: t,
        message: res.message,
      };
    }

    function finish(r: Result) {
      setResult(r);
      setState("done");
    }

    run();
  }, [params]);

  if (state === "verifying") {
    return (
      <>
        <Topbar crumbs={[{ label: "결제·구독", href: "/app/billing" }, { label: "결제 처리" }]} />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-semibold">결제 결과를 확인하는 중…</p>
        </div>
      </>
    );
  }

  const ok = result?.ok;
  return (
    <>
      <Topbar crumbs={[{ label: "결제·구독", href: "/app/billing" }, { label: "결제 완료" }]} />
      <div className="mx-auto max-w-lg px-8 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          {ok ? (
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
          ) : (
            <XCircle className="mx-auto h-14 w-14 text-danger" />
          )}
          <h1 className="mt-4 text-xl font-extrabold text-ink">
            {ok
              ? result?.type === "subscription"
                ? "구독이 시작되었습니다"
                : "결제가 완료되었습니다"
              : "결제에 실패했습니다"}
          </h1>
          {!ok && (
            <p className="mt-2 text-sm text-danger">
              {result?.message ?? "결제가 정상 처리되지 않았습니다."}
            </p>
          )}

          <dl className="mt-6 space-y-3 rounded-xl bg-slate-50 p-5 text-left text-sm">
            <Row label="상품" value={result?.productName} />
            <Row label="결제 금액" value={result ? formatKRW(result.amount) : "-"} />
            <Row
              label="결제 방식"
              value={result?.type === "subscription" ? "정기결제(빌링키)" : "일반결제(카드)"}
            />
            <Row label="주문번호" value={result?.paymentId} mono />
            <Row label="상태" value={statusLabel(result?.status)} />
            {ok && result?.type === "subscription" && result.nextBillingAt && (
              <Row
                label="다음 결제일"
                value={new Date(result.nextBillingAt).toLocaleDateString("ko-KR")}
              />
            )}
          </dl>

          <div className="mt-7 flex gap-3">
            <Link
              href="/app/billing/history"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-dark"
            >
              <Receipt className="h-4 w-4" /> 결제·구독 내역
            </Link>
            <Link
              href="/app/billing"
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              요금제로
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className={"font-semibold text-ink " + (mono ? "font-mono text-xs" : "")}>
        {value ?? "-"}
      </dd>
    </div>
  );
}

function statusLabel(s?: string) {
  if (!s) return "-";
  const map: Record<string, string> = {
    PAID: "결제완료",
    paid: "결제완료",
    FAILED: "실패",
    PENDING: "대기",
    VIRTUAL_ACCOUNT_ISSUED: "가상계좌 발급",
  };
  return map[s] ?? s;
}

export default function CompletePage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-400">불러오는 중…</div>}>
      <CompleteInner />
    </Suspense>
  );
}
