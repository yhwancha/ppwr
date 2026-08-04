import { NextResponse } from "next/server";
import { getPayment } from "@/src/shared/payments/server";
import { recordWebhook } from "@/src/shared/payments/persist";

/**
 * PortOne 결제 웹훅 수신 엔드포인트.
 * 콘솔 > 웹훅 에 이 URL(https://<도메인>/api/payment/webhook)을 등록한다.
 *
 * 결제창을 닫거나 네트워크가 끊겨도 서버가 최종 상태를 받도록 하는 안전장치.
 * 실제 상태는 신뢰할 수 있는 PortOne 조회 API로 다시 확인한다.
 *
 * ⚠️ 운영 전: PORTONE_WEBHOOK_SECRET 으로 서명 검증(@portone/server-sdk Webhook.verify)을
 *    추가해 위조 웹훅을 차단하세요.
 */
export async function POST(req: Request) {
  try {
    const raw = await req.text();
    const body = JSON.parse(raw) as {
      type?: string;
      data?: { paymentId?: string; transactionId?: string };
    };

    const paymentId = body?.data?.paymentId;
    if (paymentId) {
      // 신뢰 가능한 소스(PortOne)에서 실제 상태를 재조회
      try {
        const payment = await getPayment(paymentId);
        console.info("[portone webhook]", {
          type: body.type,
          paymentId,
          status: payment.status,
        });
        // 웹훅 이력 적재 + 해당 결제 상태 갱신 (complete/charge 가 만든 행)
        await recordWebhook({
          eventType: body.type,
          paymentId,
          portoneStatus: payment.status,
          rawPayload: body,
        });
      } catch (e) {
        console.warn("[portone webhook] 조회 실패", paymentId, (e as Error).message);
      }
    }

    // 2xx 를 반환해야 재전송되지 않는다.
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ received: false }, { status: 400 });
  }
}
