import { NextResponse } from "next/server";
import { getProduct } from "@/src/shared/payments/config";
import { payWithBillingKey } from "@/src/shared/payments/server";

/**
 * 구독(정기결제) 최초 청구.
 * 클라이언트가 빌링키 발급 성공 후 billingKey + productId + 고객정보를 보내면,
 * 서버가 빌링키로 첫 결제를 청구한다. (이후 매월 청구는 스케줄/크론으로 확장)
 */
export async function POST(req: Request) {
  try {
    const { billingKey, productId, paymentId, buyer } = (await req.json()) as {
      billingKey?: string;
      productId?: string;
      paymentId?: string;
      buyer?: { name?: string; email?: string };
    };

    if (!billingKey || !productId || !paymentId) {
      return NextResponse.json(
        { ok: false, message: "billingKey/productId/paymentId 누락" },
        { status: 400 },
      );
    }

    const product = getProduct(productId);
    if (!product || product.type !== "subscription") {
      return NextResponse.json(
        { ok: false, message: "구독 상품이 아닙니다." },
        { status: 400 },
      );
    }

    const result = await payWithBillingKey({
      paymentId,
      billingKey,
      orderName: `${product.name} 정기결제`,
      amount: product.price,
      customerId: buyer?.email || paymentId,
      customerEmail: buyer?.email,
      customerName: buyer?.name,
    });

    const paid =
      result.status === "PAID" || result.status.toLowerCase() === "paid";

    return NextResponse.json({
      ok: paid,
      status: result.status,
      paymentId,
      productId,
      productName: product.name,
      amount: product.price,
      billingKey,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: (e as Error).message },
      { status: 500 },
    );
  }
}
