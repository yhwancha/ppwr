"use client";

/**
 * 브라우저 PortOne V2 SDK 래퍼.
 *  - 일반결제: requestPayment (단건)
 *  - 구독결제: requestIssueBillingKey (빌링키 발급) → 서버에서 정기결제 청구
 *
 * SDK는 브라우저 전용이라 동적 import 한다.
 */

import { PORTONE, type Product } from "./config";
import { BASE_PATH } from "@/src/shared/base-path";

export type Buyer = { name: string; email: string; phone?: string };

/**
 * 결제창 호출 실패 진단.
 *
 * 포트원 에러 메시지("KCP 에 대해 지원하지 않는 기능입니다" 등)는 어느 채널로
 * 호출했는지 알려주지 않는다. NEXT_PUBLIC_* 는 빌드 시점에 번들로 구워지므로
 * 콘솔에서 채널키를 바꿔도 재빌드 전까지는 옛 값이 나가고, 그 사실이 화면에
 * 드러나지 않는다. 실제로 나간 채널을 찍어 두면 즉시 판별된다.
 */
function logCheckoutFailure(kind: string, response: { code?: string; message?: string }) {
  console.error(`[payments] ${kind} 실패`, {
    code: response.code,
    message: response.message,
    storeId: PORTONE.storeId,
    channelKey: PORTONE.channelKey,
  });
}

/**
 * 고유 결제 아이디 (고객사 관리).
 * ⚠️ PG 제약 두 가지를 동시에 만족해야 한다:
 *   1) 영문·숫자만 허용 (하이픈 등 특수문자 불가)
 *   2) 빌링키 발급 issueId(MxIssueNO 등)는 최대 32byte
 * → 영숫자만으로 만들고 32자 이하로 자른다.
 */
const MAX_ID_LEN = 32;

export function newPaymentId(prefix = "ppwr"): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "")
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  // prefix 도 영숫자만 유지
  const safePrefix = prefix.replace(/[^A-Za-z0-9]/g, "");
  return `${safePrefix}${rand}`.slice(0, MAX_ID_LEN);
}

/** 일반(단건) 결제창 호출. 성공 시 { paymentId } 반환, 실패 시 throw. */
export async function requestOneTimePayment(
  product: Product,
  buyer: Buyer,
  paymentId: string,
): Promise<{ paymentId: string; txId?: string }> {
  const PortOne = await import("@portone/browser-sdk/v2");

  const response = await PortOne.requestPayment({
    storeId: PORTONE.storeId,
    channelKey: PORTONE.channelKey,
    paymentId,
    orderName: product.name,
    totalAmount: product.price,
    currency: "KRW",
    payMethod: "CARD",
    customer: {
      fullName: buyer.name,
      email: buyer.email,
      // 휴대폰은 선택 입력이라 미입력 시 "" 가 되는데, 포트원은 빈 문자열을
      // NON_EMPTY_STRING 위반으로 거절한다. 값이 없으면 아예 보내지 않는다.
      phoneNumber: buyer.phone?.trim() || undefined,
    },
    // 모바일/리다이렉트 환경 대응: 완료 페이지로 돌아온다.
    redirectUrl: `${window.location.origin}${BASE_PATH}/app/billing/complete?type=onetime&productId=${product.id}`,
  });

  if (response?.code !== undefined) {
    logCheckoutFailure("결제창 호출", response);
    throw new Error(response.message ?? "결제에 실패했습니다.");
  }
  return { paymentId: response?.paymentId ?? paymentId, txId: response?.txId };
}

/** 구독용 빌링키 발급 결제창 호출. 성공 시 billingKey 반환. */
export async function requestBillingKey(
  product: Product,
  buyer: Buyer,
  paymentId: string,
): Promise<{ billingKey: string }> {
  const PortOne = await import("@portone/browser-sdk/v2");

  const response = await PortOne.requestIssueBillingKey({
    storeId: PORTONE.storeId,
    channelKey: PORTONE.channelKey,
    billingKeyMethod: "CARD",
    issueId: paymentId,
    issueName: `${product.name} 정기결제`,
    customer: {
      fullName: buyer.name,
      email: buyer.email,
      phoneNumber: buyer.phone?.trim() || undefined,
    },
    redirectUrl: `${window.location.origin}${BASE_PATH}/app/billing/complete?type=subscription&productId=${product.id}&paymentId=${paymentId}`,
  });

  if (response?.code !== undefined) {
    logCheckoutFailure("빌링키 발급창 호출", response);
    throw new Error(response.message ?? "카드 등록에 실패했습니다.");
  }
  if (!response?.billingKey) {
    throw new Error("빌링키가 발급되지 않았습니다.");
  }
  return { billingKey: response.billingKey };
}
