"use client";

/**
 * 결제/구독 데모 스토어 (localStorage).
 *
 * 목업 단계에서 결제 내역·구독 상태를 앱 전반에서 일관되게 보여주기 위한 저장소.
 * (실서비스에서는 Supabase `ppwr` 스키마의 결제/구독 테이블로 대체)
 * 결제 검증 자체는 서버(PortOne API)에서 이뤄지고, 이곳엔 그 결과만 기록한다.
 */

import type { PlanType } from "./config";

const ORDER_KEY = "ppwr.orders.v1";
const SUB_KEY = "ppwr.subscriptions.v1";

export type OrderRecord = {
  paymentId: string;
  productId: string;
  productName: string;
  type: PlanType;
  amount: number;
  status: "PAID" | "FAILED" | "PENDING";
  method?: string;
  buyerName: string;
  buyerEmail: string;
  createdAt: string; // ISO
  receiptUrl?: string;
};

export type SubscriptionRecord = {
  id: string; // = 최초 결제 paymentId
  productId: string;
  productName: string;
  amount: number;
  billingKey: string;
  status: "active" | "canceled";
  startedAt: string; // ISO
  nextBillingAt: string; // ISO
  canceledAt?: string;
};

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "[]") as T[];
  } catch {
    return [];
  }
}

function write<T>(key: string, rows: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(rows));
  // 같은 탭 내 구독 갱신용
  window.dispatchEvent(new Event("ppwr:payments-updated"));
}

// ── 주문(결제) ────────────────────────────────────────────────
export function listOrders(): OrderRecord[] {
  return read<OrderRecord>(ORDER_KEY).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function upsertOrder(order: OrderRecord) {
  const rows = read<OrderRecord>(ORDER_KEY).filter(
    (o) => o.paymentId !== order.paymentId,
  );
  rows.push(order);
  write(ORDER_KEY, rows);
}

// ── 구독 ─────────────────────────────────────────────────────
export function listSubscriptions(): SubscriptionRecord[] {
  return read<SubscriptionRecord>(SUB_KEY).sort((a, b) =>
    b.startedAt.localeCompare(a.startedAt),
  );
}

export function upsertSubscription(sub: SubscriptionRecord) {
  const rows = read<SubscriptionRecord>(SUB_KEY).filter((s) => s.id !== sub.id);
  rows.push(sub);
  write(SUB_KEY, rows);
}

export function cancelSubscription(id: string) {
  const rows = read<SubscriptionRecord>(SUB_KEY).map((s) =>
    s.id === id
      ? { ...s, status: "canceled" as const, canceledAt: new Date().toISOString() }
      : s,
  );
  write(SUB_KEY, rows);
}

/** 다음 결제일(한 달 뒤) ISO */
export function nextMonthISO(from = new Date()): string {
  const d = new Date(from);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}
