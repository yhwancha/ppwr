import ComingSoon from "@/components/app/ComingSoon";

export default function Page() {
  return (
    <ComingSoon
      title="문서 관리"
      description="제품·부품에 첨부한 증빙 문서를 한 곳에서 확인하고 관리합니다."
      items={[
        "제품·부품별 첨부 문서 목록",
        "문서 업로드 / 교체 / 만료 관리",
        "누락 증빙 추적 및 공급사 요청",
      ]}
    />
  );
}
