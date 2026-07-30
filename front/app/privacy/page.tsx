import LegalShell, { Article } from "@/components/legal/LegalShell";
import { MERCHANT } from "@/src/shared/payments/config";

export const metadata = { title: "개인정보처리방침 – PPWR AI" };

export default function PrivacyPage() {
  return (
    <LegalShell title="개인정보처리방침" updatedAt="2026-07-30">
      <Article heading="1. 수집하는 개인정보 항목">
        <ul className="list-disc pl-5">
          <li>회원가입·로그인: 이름, 이메일, 비밀번호, 회사명(선택)</li>
          <li>결제: 주문자 이름, 이메일, 휴대폰번호, 결제 승인 정보(결제수단·승인번호·금액)</li>
          <li>자동 수집: 접속 IP, 쿠키, 서비스 이용 기록</li>
        </ul>
        <p>
          카드번호 등 결제 인증정보는 결제대행사(포트원)가 처리하며, 회사는 이를 저장하지 않습니다.
        </p>
      </Article>

      <Article heading="2. 개인정보의 수집·이용 목적">
        <ul className="list-disc pl-5">
          <li>회원 식별 및 서비스 제공, 진단 결과 관리</li>
          <li>상품 결제, 정기결제 갱신, 청구 및 환불 처리</li>
          <li>고객 문의 응대 및 공지사항 전달</li>
        </ul>
      </Article>

      <Article heading="3. 보유 및 이용기간">
        <p>
          회원 탈퇴 시 지체 없이 파기합니다. 다만 관련 법령에 따라 아래 정보는 일정 기간 보관합니다.
        </p>
        <ul className="list-disc pl-5">
          <li>계약·청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
          <li>대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)</li>
          <li>소비자 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)</li>
        </ul>
      </Article>

      <Article heading="4. 개인정보의 제3자 제공 및 처리위탁">
        <p>회사는 원활한 서비스 제공을 위해 아래와 같이 업무를 위탁합니다.</p>
        <ul className="list-disc pl-5">
          <li>결제 처리: 주식회사 코리아포트원(PortOne) — 결제 및 정기결제 대행</li>
          <li>인프라·데이터 보관: Supabase, {MERCHANT.hostingProvider} — 서비스 호스팅</li>
        </ul>
      </Article>

      <Article heading="5. 이용자의 권리">
        <p>
          이용자는 언제든지 자신의 개인정보를 조회·수정하거나 회원 탈퇴를 통해 수집·이용 동의를 철회할 수 있습니다.
        </p>
      </Article>

      <Article heading="6. 개인정보 보호책임자">
        <ul className="list-none space-y-1">
          <li>보호책임자: {MERCHANT.privacyOfficer}</li>
          <li>연락처: {MERCHANT.tel} / {MERCHANT.email}</li>
          <li>상호: {MERCHANT.companyName} (사업자등록번호 {MERCHANT.bizRegNo})</li>
        </ul>
      </Article>
    </LegalShell>
  );
}
