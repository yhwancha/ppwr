import ComingSoon from "@/components/app/ComingSoon";

export default function Page() {
  return (
    <ComingSoon
      title="프로필 관리"
      description="사용자·회사 기본정보를 조회·수정합니다. RESTUDIO 연동 원천 정보와 PPWR 특화 정보를 구분합니다."
      items={["프로필 조회·수정", "회사 정보 관리", "연동 상태 표시"]}
    />
  );
}
