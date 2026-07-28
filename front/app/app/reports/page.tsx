import ComingSoon from "@/components/app/ComingSoon";
export default function Page() {
  return (
    <ComingSoon
      title="리포트"
      description="진단 결과를 기반으로 준비도 리포트, 요건 진단 리포트, DoC/TD, 바이어 요약본을 생성·조회합니다."
      items={["리포트 생성 (유형·템플릿별)", "리포트 조회", "PDF 출력"]}
    />
  );
}
