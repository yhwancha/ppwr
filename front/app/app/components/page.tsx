import ComingSoon from "@/components/app/ComingSoon";
export default function Page() {
  return (
    <ComingSoon
      title="부품 관리"
      description="포장 부품(용기·캡·라벨·박스 등)을 마스터로 관리하고, 여러 제품에서 재사용합니다. 부품별 소재·중량·공급사·증빙자료를 등록합니다."
      items={["부품 목록 (직접 등록 / 공급사 / 리베이션 공급)", "부품 등록 + 증빙자료 업로드", "부품 상세 (조회·수정 권한 구분)"]}
    />
  );
}
