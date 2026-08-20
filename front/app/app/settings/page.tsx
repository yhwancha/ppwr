import { redirect } from "next/navigation";

/** 설정 진입 시 첫 하위 메뉴(보안 설정)로 보낸다. */
export default function Page() {
  redirect("/app/settings/security");
}
