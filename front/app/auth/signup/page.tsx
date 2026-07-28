"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthDivider, GoogleButton } from "@/components/auth/fields";
import { SignupSchema, useSignup, type SignupForm } from "@/src/features/auth/use-signup";
import { signInWithGoogle } from "@/src/features/auth/use-login";

export default function SignupPage() {
  const router = useRouter();
  const { mutate: signup, isPending } = useSignup();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(SignupSchema),
    defaultValues: { name: "", company: "", email: "", password: "", confirm: "" },
  });

  const onSubmit = (data: SignupForm) => {
    setServerError(null);
    signup(data, {
      onSuccess: () => router.push("/"),
      onError: (e) =>
        setServerError(e instanceof Error ? e.message : "회원가입에 실패했습니다."),
    });
  };

  return (
    <div>
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-ink">회원가입</h1>
        <p className="mt-2 text-sm text-slate-500">
          간단한 정보만 입력하면 PPWR 진단을 바로 시작할 수 있습니다.
        </p>
      </div>

      {serverError && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-danger">
          {serverError}
        </p>
      )}

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <FormField label="이름" required error={errors.name?.message}>
          <input {...register("name")} placeholder="홍길동" className={inputCls} />
        </FormField>
        <FormField label="회사명" error={errors.company?.message}>
          <input {...register("company")} placeholder="(주)리스튜디오" className={inputCls} />
        </FormField>
        <FormField label="이메일" required error={errors.email?.message}>
          <input type="email" {...register("email")} placeholder="name@company.com" className={inputCls} />
        </FormField>
        <FormField label="비밀번호" required error={errors.password?.message}>
          <input type="password" {...register("password")} placeholder="8자 이상" className={inputCls} />
        </FormField>
        <FormField label="비밀번호 확인" required error={errors.confirm?.message}>
          <input type="password" {...register("confirm")} placeholder="비밀번호 재입력" className={inputCls} />
        </FormField>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {isPending ? "가입 중…" : "회원가입"}
        </button>
      </form>

      <AuthDivider>또는</AuthDivider>

      <GoogleButton label="Google 계정으로 시작하기" onClick={() => signInWithGoogle()} />

      <p className="mt-8 text-center text-sm text-slate-500">
        이미 계정이 있으신가요?{" "}
        <Link href="/auth/login" className="font-semibold text-primary hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-primary";

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
