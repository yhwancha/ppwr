import { redirect } from "next/navigation";

/** 프로필은 설정 섹션으로 통합됐다. 기존 경로는 유지하고 리다이렉트한다. */
export default function Page() {
  redirect("/app/settings/profile");
}
