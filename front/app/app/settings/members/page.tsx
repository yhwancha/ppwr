import ComingSoon from "@/components/app/ComingSoon";

export default function Page() {
  return (
    <ComingSoon
      title="팀원 / 권한 관리"
      description="회사 계정에 팀원을 초대하고 권한을 부여합니다. 권한은 마스터·매니저·게스트 3종이며, 최초 가입 계정에 마스터 권한이 부여됩니다."
      items={["팀원 초대·삭제", "권한(마스터/매니저/게스트) 변경", "초대 상태 확인"]}
    />
  );
}
