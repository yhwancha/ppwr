import LegalShell, { Article } from "@/components/legal/LegalShell";
import { MERCHANT } from "@/src/shared/payments/config";

export const metadata = { title: "이용약관 – PPWR AI" };

export default function TermsPage() {
  return (
    <LegalShell title="이용약관" updatedAt="2026-07-30">
      <Article heading="제1조 (목적)">
        <p>
          본 약관은 {MERCHANT.companyName}(이하 &ldquo;회사&rdquo;)가 제공하는 {MERCHANT.serviceName}
          {" "}서비스(EU 포장폐기물 규정(PPWR) AI 진단 및 관련 서비스, 이하 &ldquo;서비스&rdquo;)의 이용과 관련하여 회사와
          이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
        </p>
      </Article>

      <Article heading="제2조 (서비스의 내용 및 상품)">
        <p>회사는 다음의 유료 상품을 제공합니다.</p>
        <ul className="list-disc pl-5">
          <li>PPWR 셀프진단권(단건 결제): 제품 1건에 대한 적합성 진단 이용권 (49,000원, 1회)</li>
          <li>매니지드 베이직(월 정기결제): 매월 진단 크레딧 및 지원 제공 (99,000원/월)</li>
          <li>매니지드 프로(월 정기결제): 무제한 진단 및 전담 지원 (299,000원/월)</li>
        </ul>
        <p>진단 결과는 참고용 자료이며, 법적 적합성에 대한 최종 판단·책임을 대체하지 않습니다.</p>
      </Article>

      <Article heading="제3조 (결제 수단 및 정기결제)">
        <p>
          결제는 결제대행사 포트원(PortOne, 주식회사 코리아포트원)을 통해 신용·체크카드 등으로 처리됩니다. 회사는
          이용자의 카드정보를 저장하지 않습니다.
        </p>
        <p>
          정기결제 상품은 이용자가 등록한 결제수단으로 매월 동일한 날짜에 자동으로 결제되며, 이용자가 해지하기 전까지
          갱신됩니다. 해지는 서비스 내 &ldquo;결제·구독 내역&rdquo; 화면에서 언제든지 할 수 있습니다.
        </p>
      </Article>

      <Article heading="제4조 (청약철회 및 환불)">
        <p>
          이용자는 관련 법령 및 회사의 취소·환불 규정에 따라 청약철회 및 환불을 요청할 수 있습니다. 구체적인 내용은
          별도의 <a href="/refund" className="font-semibold text-primary underline">취소·환불 규정</a>을 따릅니다.
        </p>
      </Article>

      <Article heading="제5조 (회사의 의무)">
        <p>
          회사는 관련 법령과 본 약관이 정하는 바에 따라 지속적이고 안정적으로 서비스를 제공하기 위하여 노력하며,
          이용자의 개인정보를 <a href="/privacy" className="font-semibold text-primary underline">개인정보처리방침</a>에
          따라 보호합니다.
        </p>
      </Article>

      <Article heading="제6조 (책임의 제한)">
        <p>
          천재지변, 이용자의 귀책사유, 제3자(PG·호스팅 등)의 장애 등 회사의 통제를 벗어난 사유로 발생한 손해에
          대하여 회사는 책임을 부담하지 않습니다.
        </p>
      </Article>

      <Article heading="제7조 (사업자 정보 및 문의)">
        <ul className="list-none space-y-1">
          <li>상호: {MERCHANT.companyName}</li>
          <li>대표자: {MERCHANT.ceo}</li>
          <li>사업자등록번호: {MERCHANT.bizRegNo}</li>
          <li>통신판매업신고번호: {MERCHANT.mailOrderNo}</li>
          <li>주소: {MERCHANT.address}</li>
          <li>고객센터: {MERCHANT.tel} / {MERCHANT.email}</li>
        </ul>
      </Article>
    </LegalShell>
  );
}
