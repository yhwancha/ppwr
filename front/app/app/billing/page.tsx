import ComingSoon from "@/components/app/ComingSoon";
export default function Page() {
  return (
    <ComingSoon
      title="결제·구독"
      description="DIY 셀프진단(단건)과 매니지드 서비스(구독) 결제를 관리합니다. PG 연동 방식 확정 후 구현합니다."
      items={["결제 수단 설정", "결제·구독 신청", "결제 내역 조회"]}
    />
  );
}
