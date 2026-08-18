import LegalShell, { Article } from "@/components/legal/LegalShell";
import { MERCHANT } from "@/src/shared/payments/config";

export const metadata = { title: "이용약관 – PPWR AI" };

export default function TermsPage() {
  return (
    <LegalShell title="이용약관" updatedAt="2026-07-31">
      <Article heading="제1조 (목적)">
        <p>
          본 약관은 {MERCHANT.companyName}(이하 &ldquo;회사&rdquo;)가 제공하는 {MERCHANT.serviceName}
          {" "}서비스(EU 포장폐기물 규정(PPWR) AI 진단 및 관련 서비스, 이하 &ldquo;서비스&rdquo;)의 이용과 관련하여 회사와
          이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
        </p>
      </Article>

      <Article heading="제2조 (약관의 게시 및 개정)">
        <p>
          회사는 본 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 화면에 게시합니다.
        </p>
        <p>
          회사는 「약관의 규제에 관한 법률」, 「전자상거래 등에서의 소비자보호에 관한 법률」 등 관련 법령을 위배하지
          않는 범위에서 약관을 개정할 수 있으며, 개정 시 적용일자 및 개정사유를 명시하여 적용일 7일 전(이용자에게
          불리하거나 중대한 변경은 30일 전)부터 공지합니다. 이용자가 개정약관 시행일까지 거부의사를 표시하지 않으면
          개정에 동의한 것으로 봅니다.
        </p>
      </Article>

      <Article heading="제3조 (이용계약의 체결 및 회원가입)">
        <p>
          이용계약은 이용자가 본 약관에 동의하고 회원가입을 신청한 후 회사가 이를 승낙함으로써 성립합니다.
        </p>
        <p>
          이용자는 가입 시 정확한 정보를 제공해야 하며, 타인의 정보를 도용하거나 허위 정보를 기재한 경우 서비스
          이용이 제한될 수 있습니다. 계정 및 비밀번호 관리 책임은 이용자에게 있습니다.
        </p>
      </Article>

      <Article heading="제4조 (서비스의 내용 및 상품)">
        <p>회사는 다음의 유료 상품을 제공합니다. (자세한 내용·가격은 요금제 페이지 참조)</p>
        <ul className="list-disc pl-5">
          <li>건별 서비스(단건 결제): PPWR AI 진단·TD 작성·DoC 발행 등 필요한 서비스를 건별 단가로 결제하는 1회성 이용.</li>
          <li>문서 패키지(단건 결제): 등록 대행·문서 발행·EPR 기초자료 등을 묶어 제공하는 1회성 패키지.</li>
        </ul>
        <p>정확한 상품 구성 및 가격은{" "}
          <a href="/pricing" className="font-semibold text-primary underline">요금제</a>{" "}
          페이지에 고지된 내용을 따릅니다. 진단 결과는 참고용 자료이며, 법적 적합성에 대한 최종 판단·책임을 대체하지 않습니다.</p>
      </Article>

      <Article heading="제5조 (결제 수단)">
        <p>
          결제는 결제대행사 포트원(PortOne, 주식회사 코리아포트원)을 통해 신용·체크카드 등으로 처리됩니다. 회사는
          이용자의 카드정보를 저장하지 않습니다.
        </p>
        <p>
          유료 상품은 이용 시점에 건별로 결제되며, 별도의 약정이나 자동 갱신 결제는 이루어지지 않습니다.
        </p>
      </Article>

      <Article heading="제6조 (청약철회 및 환불)">
        <p>
          이용자는 관련 법령 및 회사의 취소·환불 규정에 따라 청약철회 및 환불을 요청할 수 있습니다. 구체적인 내용은
          별도의 <a href="/refund" className="font-semibold text-primary underline">취소·환불 규정</a>을 따릅니다.
        </p>
      </Article>

      <Article heading="제7조 (계약 해지 및 이용제한)">
        <p>
          이용자는 언제든지 회원 탈퇴를 통해 이용계약을 해지할 수 있습니다. 회사는 이용자가 본 약관 또는 관련 법령을
          위반하거나 서비스의 정상적인 운영을 방해하는 경우 사전 통지 후(긴급한 경우 사후) 서비스 이용을 제한하거나
          이용계약을 해지할 수 있습니다.
        </p>
      </Article>

      <Article heading="제8조 (회사와 이용자의 의무)">
        <p>
          회사는 관련 법령과 본 약관이 정하는 바에 따라 지속적이고 안정적으로 서비스를 제공하기 위하여 노력하며,
          이용자의 개인정보를 <a href="/privacy" className="font-semibold text-primary underline">개인정보처리방침</a>에
          따라 보호합니다.
        </p>
        <p>
          이용자는 서비스 이용 시 관련 법령과 본 약관을 준수해야 하며, 회사의 서비스를 부정한 목적으로 이용하거나
          타인의 권리를 침해해서는 안 됩니다.
        </p>
      </Article>

      <Article heading="제9조 (책임의 제한)">
        <p>
          천재지변, 이용자의 귀책사유, 제3자(PG·호스팅 등)의 장애 등 회사의 통제를 벗어난 사유로 발생한 손해에
          대하여 회사는 책임을 부담하지 않습니다. 서비스가 제공하는 진단·리포트는 참고자료로서, 이용자의 최종적인
          규제 준수 판단 및 그 결과에 대한 책임을 대체하지 않습니다.
        </p>
      </Article>

      <Article heading="제10조 (분쟁의 해결 및 준거법)">
        <p>
          본 약관 및 서비스 이용과 관련하여 회사와 이용자 간 분쟁이 발생한 경우, 양 당사자는 신의성실의 원칙에 따라
          원만히 해결하기 위해 노력합니다. 협의가 이루어지지 않을 경우 「전자상거래 등에서의 소비자보호에 관한 법률」
          등 관련 법령 및 상관례에 따릅니다.
        </p>
        <p>
          본 약관은 대한민국 법령에 따라 규율되며, 분쟁에 관한 소송의 관할법원은 민사소송법에 따른 법원으로 합니다.
        </p>
      </Article>

      <Article heading="제11조 (사업자 정보 및 문의)">
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
