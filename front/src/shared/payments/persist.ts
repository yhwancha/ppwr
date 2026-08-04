import { createClient as createSessionClient } from "@/src/shared/supabase/server";
import { createAdminClient } from "@/src/shared/supabase/admin";

/**
 * PortOne 결제 결과를 ppwr 스키마(admin 이 읽는 테이블)에 적재하는 레이어.
 *   - Payment       : 결제 건 (단건/구독 회차 공용)
 *   - Subscription  : 구독 (빌링키)
 *   - PaymentWebhookLog : PG 웹훅 이력
 *
 * 쓰기는 RLS 상 service_role 만 가능 → createAdminClient() 사용.
 * 결제자(user_id) 는 위변조 방지를 위해 **서버 세션(쿠키)** 에서 확보한다.
 */

export type PaymentStatus =
  | "paid"
  | "failed"
  | "canceled"
  | "refunded"
  | "partial_refunded"
  | "pending";

/** PortOne 결제 상태 → admin Payment.status 매핑 */
export function mapPortOneStatus(s?: string): PaymentStatus {
  switch ((s ?? "").toUpperCase()) {
    case "PAID":
      return "paid";
    case "FAILED":
      return "failed";
    case "CANCELLED":
    case "CANCELED":
      return "canceled";
    case "PARTIAL_CANCELLED":
    case "PARTIAL_CANCELED":
      return "partial_refunded";
    // VIRTUAL_ACCOUNT_ISSUED, READY, PENDING, PAY_PENDING 등 → 미완료
    default:
      return "pending";
  }
}

/** 로그인 세션(쿠키) → public.User.id. 미로그인/미매핑이면 null. */
export async function resolveUserId(): Promise<number | null> {
  try {
    const sb = await createSessionClient();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return null;
    const { data } = await sb
      .from("User")
      .select("id")
      .eq("auth_id", user.id)
      .maybeSingle();
    return (data as { id: number } | null)?.id ?? null;
  } catch {
    return null;
  }
}

type AdminClient = ReturnType<typeof createAdminClient>;

/** productId(config id) → ppwr.Plan.id (code 매칭). 없으면 null. */
async function resolvePlanId(
  admin: AdminClient,
  productId: string,
): Promise<number | null> {
  const { data } = await admin
    .schema("ppwr")
    .from("Plan")
    .select("id")
    .eq("code", productId)
    .maybeSingle();
  return (data as { id: number } | null)?.id ?? null;
}

/** 단건 결제 적재 (idempotent: pg_transaction_id upsert) */
export async function recordOneTimePayment(input: {
  userId: number | null;
  productId: string;
  paymentId: string;
  amount: number;
  portoneStatus?: string;
  method?: string | null;
  receiptUrl?: string | null;
}): Promise<void> {
  if (input.userId == null) {
    console.warn("[persist] user 미확인 — Payment 적재 skip", input.paymentId);
    return;
  }
  try {
    const admin = createAdminClient();
    const planId = await resolvePlanId(admin, input.productId);
    const status = mapPortOneStatus(input.portoneStatus);
    const now = new Date().toISOString();
    const { error } = await admin
      .schema("ppwr")
      .from("Payment")
      .upsert(
        {
          user_id: input.userId,
          plan_id: planId,
          amount: input.amount,
          currency: "KRW",
          status,
          method: input.method ?? "card",
          pg_provider: "portone",
          pg_transaction_id: input.paymentId,
          receipt_url: input.receiptUrl ?? null,
          paid_at: status === "paid" ? now : null,
          failed_at: status === "failed" ? now : null,
        },
        { onConflict: "pg_transaction_id" },
      );
    if (error) console.error("[persist] Payment upsert 실패", error.message);
  } catch (e) {
    console.error("[persist] recordOneTimePayment 예외", (e as Error).message);
  }
}

/** 구독 회차 결제 적재: Subscription upsert + Payment upsert(구독 연결) */
export async function recordSubscriptionCharge(input: {
  userId: number | null;
  productId: string;
  paymentId: string;
  billingKey: string;
  amount: number;
  portoneStatus?: string;
}): Promise<void> {
  if (input.userId == null) {
    console.warn("[persist] user 미확인 — 구독 적재 skip", input.paymentId);
    return;
  }
  try {
    const admin = createAdminClient();
    const planId = await resolvePlanId(admin, input.productId);
    const status = mapPortOneStatus(input.portoneStatus);
    const now = new Date().toISOString();

    // 구독: 같은 유저+플랜의 활성 구독이 있으면 재사용, 없으면 생성
    let subscriptionId: number | null = null;
    const { data: existing } = await admin
      .schema("ppwr")
      .from("Subscription")
      .select("id")
      .eq("user_id", input.userId)
      .eq("plan_id", planId as number)
      .in("status", ["active", "trialing", "past_due"])
      .maybeSingle();

    if (existing) {
      subscriptionId = (existing as { id: number }).id;
      await admin
        .schema("ppwr")
        .from("Subscription")
        .update({ pg_billing_key: input.billingKey, pg_provider: "portone" })
        .eq("id", subscriptionId);
    } else {
      const { data: created, error: subErr } = await admin
        .schema("ppwr")
        .from("Subscription")
        .insert({
          user_id: input.userId,
          plan_id: planId,
          status: status === "paid" ? "active" : "past_due",
          started_at: now,
          current_period_start: now,
          pg_provider: "portone",
          pg_billing_key: input.billingKey,
        })
        .select("id")
        .single();
      if (subErr) console.error("[persist] Subscription insert 실패", subErr.message);
      subscriptionId = (created as { id: number } | null)?.id ?? null;
    }

    const { error: payErr } = await admin
      .schema("ppwr")
      .from("Payment")
      .upsert(
        {
          user_id: input.userId,
          plan_id: planId,
          subscription_id: subscriptionId,
          amount: input.amount,
          currency: "KRW",
          status,
          method: "card",
          pg_provider: "portone",
          pg_transaction_id: input.paymentId,
          paid_at: status === "paid" ? now : null,
          failed_at: status === "failed" ? now : null,
        },
        { onConflict: "pg_transaction_id" },
      );
    if (payErr) console.error("[persist] 구독 Payment upsert 실패", payErr.message);
  } catch (e) {
    console.error("[persist] recordSubscriptionCharge 예외", (e as Error).message);
  }
}

/** 웹훅 이력 적재 + (있으면) 해당 결제 상태 갱신. 세션 없음 → service_role 만. */
export async function recordWebhook(input: {
  eventType?: string;
  paymentId?: string;
  portoneStatus?: string;
  rawPayload?: unknown;
}): Promise<void> {
  try {
    const admin = createAdminClient();
    // 1) 웹훅 이력 적재 (감사/재처리용)
    await admin
      .schema("ppwr")
      .from("PaymentWebhookLog")
      .insert({
        pg_provider: "portone",
        event_type: input.eventType ?? null,
        pg_transaction_id: input.paymentId ?? null,
        payload: (input.rawPayload as object) ?? null,
        processed: true,
      });

    // 2) 결제 상태 갱신 (complete/charge 가 먼저 만든 행)
    if (input.paymentId && input.portoneStatus) {
      const status = mapPortOneStatus(input.portoneStatus);
      const patch: Record<string, unknown> = { status };
      if (status === "paid") patch.paid_at = new Date().toISOString();
      if (status === "failed") patch.failed_at = new Date().toISOString();
      await admin
        .schema("ppwr")
        .from("Payment")
        .update(patch)
        .eq("pg_transaction_id", input.paymentId);
    }
  } catch (e) {
    console.error("[persist] recordWebhook 예외", (e as Error).message);
  }
}
