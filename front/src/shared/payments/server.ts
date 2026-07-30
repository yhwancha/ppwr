/**
 * 서버 전용 PortOne V2 REST API 헬퍼.
 * (API Route 핸들러에서만 import → 클라이언트 번들에 포함되지 않음)
 * API Secret 은 절대 클라이언트로 노출하지 않는다.
 */

const API_BASE = "https://api.portone.io";

function apiSecret(): string {
  const s = process.env.PORTONE_V2_API_SECRET;
  if (!s) throw new Error("PORTONE_V2_API_SECRET 미설정");
  return s;
}

function authHeaders(): HeadersInit {
  return {
    Authorization: `PortOne ${apiSecret()}`,
    "Content-Type": "application/json",
  };
}

export type PortOnePayment = {
  status: string; // PAID, VIRTUAL_ACCOUNT_ISSUED, FAILED ...
  orderName?: string;
  amount?: { total: number };
  method?: { type?: string };
  paidAt?: string;
  receiptUrl?: string;
};

/** 결제 단건 조회 (일반결제 검증용) */
export async function getPayment(paymentId: string): Promise<PortOnePayment> {
  const res = await fetch(
    `${API_BASE}/payments/${encodeURIComponent(paymentId)}`,
    { headers: authHeaders(), cache: "no-store" },
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PortOne getPayment 실패(${res.status}): ${body}`);
  }
  return (await res.json()) as PortOnePayment;
}

/** 빌링키로 정기결제 청구 (구독 결제용) */
export async function payWithBillingKey(params: {
  paymentId: string;
  billingKey: string;
  orderName: string;
  amount: number;
  customerId: string;
  customerEmail?: string;
  customerName?: string;
}): Promise<{ status: string; paymentId: string }> {
  const res = await fetch(
    `${API_BASE}/payments/${encodeURIComponent(params.paymentId)}/billing-key`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        billingKey: params.billingKey,
        orderName: params.orderName,
        customer: {
          id: params.customerId,
          email: params.customerEmail,
          name: params.customerName ? { full: params.customerName } : undefined,
        },
        amount: { total: params.amount },
        currency: "KRW",
      }),
    },
  );
  const data = (await res.json().catch(() => ({}))) as {
    payment?: { status?: string };
    status?: string;
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message ?? `정기결제 청구 실패(${res.status})`);
  }
  return {
    status: data.payment?.status ?? data.status ?? "PAID",
    paymentId: params.paymentId,
  };
}
