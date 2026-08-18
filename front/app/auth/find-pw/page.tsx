import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/primitives";
import { AuthField } from "@/components/auth/fields";

export const metadata: Metadata = {
  title: "비밀번호 찾기 – PPWR AI",
};

export default function FindPasswordPage() {
  return (
    <div>
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-ink">비밀번호 찾기</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          가입한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
        </p>
      </div>

      <form className="mt-8 space-y-5">
        <AuthField
          label="이메일"
          type="email"
          placeholder="name@company.com"
          required
        />
        <Button className="w-full">재설정 링크 보내기</Button>
      </form>

      <Link
        href="/auth/login"
        className="mt-8 flex items-center justify-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> 로그인으로 돌아가기
      </Link>
    </div>
  );
}
