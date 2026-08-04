import { NextResponse } from "next/server";
import { getProduct } from "@/src/shared/payments/config";
import { getPayment } from "@/src/shared/payments/server";
import { resolveUserId, recordOneTimePayment } from "@/src/shared/payments/persist";

/**
 * 일반결제 완료 검증.
 * 클라이언트가 결제창 성공 후 paymentId + productId 를 보내면,
 * PortOne 결제 단건조회로 실제 상태·금액을 검증한다. (위·변조 방지)
 */
export async function POST(req: Request) {
  try {
    const { paymentId, productId } = (await req.json()) as {
      paymentId?: string;
      productId?: string;
    };
    if (!paymentId || !productId) {
      return NextResponse.json(
        { ok: false, message: "paymentId/productId 누락" },
        { status: 400 },
      );
    }

    const product = getProduct(productId);
    if (!product) {
      return NextResponse.json(
        { ok: false, message: "알 수 없는 상품" },
        { status: 400 },
      );
    }

    const payment = await getPayment(paymentId);

    // 서버가 아는 상품 가격과 실제 결제 금액이 일치하는지 검증
    if (payment.amount?.total !== product.price) {
      return NextResponse.json(
        {
          ok: false,
          status: payment.status,
          message: "결제 금액이 상품 가격과 일치하지 않습니다.",
        },
        { status: 400 },
      );
    }

    // ── DB 적재 (admin "결제·환불 조회" 가 읽는 ppwr.Payment) ──
    // 결제자(user_id)는 위변조 방지를 위해 서버 세션(쿠키)에서 확보. best-effort.
    const userId = await resolveUserId();
    await recordOneTimePayment({
      userId,
      productId,
      paymentId,
      amount: payment.amount?.total ?? product.price,
      portoneStatus: payment.status,
      method: payment.method?.type ?? null,
      receiptUrl: payment.receiptUrl ?? null,
    });

    const paid = payment.status === "PAID";
    return NextResponse.json({
      ok: paid,
      status: payment.status,
      paymentId,
      productId,
      productName: product.name,
      amount: payment.amount?.total ?? product.price,
      method: payment.method?.type,
      paidAt: payment.paidAt,
      receiptUrl: payment.receiptUrl,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: (e as Error).message },
      { status: 500 },
    );
  }
}
