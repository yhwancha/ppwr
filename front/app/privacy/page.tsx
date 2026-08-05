import LegalShell, { Article } from "@/components/legal/LegalShell";
import { MERCHANT } from "@/src/shared/payments/config";

export const metadata = { title: "개인정보처리방침 – PPWR AI" };

export default function PrivacyPage() {
  return (
    <LegalShell title="개인정보처리방침" updatedAt="2026-07-31">
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
          원칙적으로 개인정보 수집·이용 목적이 달성되면 지체 없이 파기합니다. 다만 관련 법령에 따라 아래 정보는 일정
          기간 보관합니다.
        </p>
        <ul className="list-disc pl-5">
          <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
          <li>대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)</li>
          <li>소비자 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)</li>
          <li>웹사이트 방문(접속 로그) 기록: 3개월 (통신비밀보호법)</li>
        </ul>
      </Article>

      <Article heading="4. 개인정보의 파기 절차 및 방법">
        <p>
          회사는 보유기간이 경과하거나 처리 목적이 달성된 개인정보를 지체 없이 파기합니다.
        </p>
        <ul className="list-disc pl-5">
          <li>전자적 파일: 복구·재생이 불가능한 기술적 방법으로 영구 삭제</li>
          <li>출력물 등: 분쇄하거나 소각</li>
        </ul>
      </Article>

      <Article heading="5. 개인정보의 제3자 제공 및 처리위탁">
        <p>
          회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 다만 원활한 서비스 제공을 위해 아래와
          같이 업무를 위탁합니다.
        </p>
        <ul className="list-disc pl-5">
          <li>결제 처리: 주식회사 코리아포트원(PortOne) — 결제 및 정기결제 대행</li>
          <li>인프라·데이터 보관: Supabase, {MERCHANT.hostingProvider} — 서비스 호스팅</li>
        </ul>
      </Article>

      <Article heading="6. 쿠키 등 자동수집장치의 운영 및 거부">
        <p>
          회사는 이용자에게 맞춤형 서비스를 제공하기 위해 쿠키(cookie)를 사용할 수 있습니다. 이용자는 웹브라우저
          설정을 통해 쿠키 저장을 거부할 수 있으며, 이 경우 로그인 등 일부 서비스 이용에 제한이 있을 수 있습니다.
        </p>
      </Article>

      <Article heading="7. 개인정보의 안전성 확보조치">
        <p>회사는 개인정보의 안전한 처리를 위해 다음의 조치를 취합니다.</p>
        <ul className="list-disc pl-5">
          <li>비밀번호 등 중요정보의 암호화 저장·전송(HTTPS)</li>
          <li>개인정보 처리 시스템에 대한 접근권한 관리 및 접근통제</li>
          <li>결제 인증정보는 회사가 저장하지 않고 결제대행사(PG)가 처리</li>
        </ul>
      </Article>

      <Article heading="8. 정보주체(이용자)의 권리 및 행사 방법">
        <p>
          이용자는 언제든지 자신의 개인정보를 조회·수정하거나, 처리 정지 및 삭제(회원 탈퇴를 통한 동의 철회)를 요청할
          수 있습니다. 서비스 내 설정 화면 또는 아래 개인정보 보호책임자에게 연락하여 권리를 행사할 수 있으며, 회사는
          지체 없이 조치합니다.
        </p>
      </Article>

      <Article heading="9. 개인정보 보호책임자">
        <ul className="list-none space-y-1">
          <li>보호책임자: {MERCHANT.privacyOfficer}</li>
          <li>연락처: {MERCHANT.tel} / {MERCHANT.email}</li>
          <li>상호: {MERCHANT.companyName} (사업자등록번호 {MERCHANT.bizRegNo})</li>
        </ul>
      </Article>

      <Article heading="10. 권익침해 구제 방법">
        <p>
          개인정보 침해로 인한 상담·신고가 필요한 경우 아래 기관에 문의할 수 있습니다.
        </p>
        <ul className="list-disc pl-5">
          <li>개인정보분쟁조정위원회: (국번없이) 1833-6972 · kopico.go.kr</li>
          <li>개인정보침해신고센터(KISA): (국번없이) 118 · privacy.kisa.or.kr</li>
          <li>대검찰청 사이버수사과: (국번없이) 1301 · spo.go.kr</li>
          <li>경찰청 사이버수사국: (국번없이) 182 · ecrm.police.go.kr</li>
        </ul>
      </Article>

      <Article heading="11. 개인정보처리방침의 변경">
        <p>
          본 방침은 법령·정책 또는 서비스 변경에 따라 개정될 수 있으며, 개정 시 시행일 및 변경사항을 서비스 화면을
          통해 공지합니다.
        </p>
      </Article>
    </LegalShell>
  );
}
