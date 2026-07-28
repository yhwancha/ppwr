import ComingSoon from "@/components/app/ComingSoon";
export default function Page() {
  return (
    <ComingSoon
      title="진단"
      description="제품·부품·증빙 데이터를 기준으로 PPWR 요건 적합성을 단계별로 진단합니다."
      items={["진단 생성 / 단계형 진단 진행", "문서 업로드 → 정보 추출(OCR) → 추출값 검토", "AI·규칙 기반 판정 → 진단 결과 → 보완요청"]}
    />
  );
}
