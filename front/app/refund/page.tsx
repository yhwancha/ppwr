import LegalShell, { Article } from "@/components/legal/LegalShell";
import { MERCHANT } from "@/src/shared/payments/config";

export const metadata = { title: "취소·환불 규정 – PPWR AI" };

export default function RefundPage() {
  return (
    <LegalShell title="취소·환불 및 청약철회 규정" updatedAt="2026-07-30">
      <Article heading="1. 청약철회 기간">
        <p>
          이용자는 결제일로부터 <b>7일 이내</b>에 청약철회(전액 환불)를 요청할 수 있습니다. 단, 「전자상거래 등에서의
          소비자보호에 관한 법률」에 따라 아래의 경우 청약철회가 제한될 수 있습니다.
        </p>
        <ul className="list-disc pl-5">
          <li>이용자가 진단(콘텐츠 열람)을 이미 개시하여 서비스가 제공된 경우</li>
          <li>이용자의 사용 또는 일부 소비로 상품의 가치가 현저히 감소한 경우</li>
        </ul>
      </Article>

      <Article heading="2. 단건 문서 패키지 환불">
        <ul className="list-disc pl-5">
          <li>서비스 미개시: 결제일로부터 7일 이내 전액 환불</li>
          <li>진단·문서 발행 등 서비스 개시 후: 재화의 성격상 환불이 제한되며, 진행 정도에 따라 부분 환불될 수 있습니다.</li>
        </ul>
      </Article>

      <Article heading="3. 정기구독 상품 해지 및 환불">
        <ul className="list-disc pl-5">
          <li>해지는 서비스 내 &ldquo;결제·구독 내역&rdquo;에서 언제든지 가능하며, 해지 시 다음 결제일부터 청구되지 않습니다.</li>
          <li>이미 결제된 당월 구독료는 이용내역이 없는 경우 결제일로부터 7일 이내 전액 환불됩니다.</li>
          <li>당월 크레딧을 사용한 경우, 사용분을 제외한 잔여분에 대해 부분 환불될 수 있습니다.</li>
        </ul>
      </Article>

      <Article heading="4. 환불 방법 및 기간">
        <p>
          환불은 결제하신 수단으로 이루어지며, 카드 결제의 경우 승인 취소, 무통장/가상계좌의 경우 지정 계좌로
          환불됩니다. 환불 요청 승인 후 <b>영업일 기준 3~5일</b> 이내 처리됩니다(카드사 사정에 따라 지연될 수 있음).
        </p>
      </Article>

      <Article heading="5. 환불 신청 방법">
        <p>
          아래 고객센터로 주문번호와 함께 환불을 요청해 주세요.
        </p>
        <ul className="list-none space-y-1">
          <li>고객센터: {MERCHANT.tel}</li>
          <li>이메일: {MERCHANT.email}</li>
          <li>상호: {MERCHANT.companyName} (통신판매업신고 {MERCHANT.mailOrderNo})</li>
        </ul>
      </Article>
    </LegalShell>
  );
}
