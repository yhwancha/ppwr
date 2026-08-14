"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthDivider, GoogleButton } from "@/components/auth/fields";
import {
  LoginSchema,
  signInWithGoogle,
  useLogin,
  type LoginForm,
} from "@/src/features/auth/use-login";

function LoginForm_() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // 기본은 홈(/)으로 — 로그인 후 랜딩에 머무르며 "대시보드로 이동" 버튼으로 넘어간다.
  // 보호 경로(/app)에서 리다이렉트돼 온 경우에만 그 경로로 복귀.
  const redirect = searchParams.get("redirect") || "/";
  const { mutate: login, isPending } = useLogin();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginForm) => {
    setServerError(null);
    login(data, {
      onSuccess: () => router.push(redirect),
      onError: (e) =>
        setServerError(
          e instanceof Error
            ? e.message
            : "이메일 또는 비밀번호가 올바르지 않습니다.",
        ),
    });
  };

  return (
    <div>
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-ink">로그인</h1>
        <p className="mt-2 text-sm text-slate-500">
          RESTUDIO 계정으로 PPWR 진단 서비스에 로그인하세요.
        </p>
      </div>

      {serverError && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-danger">
          {serverError}
        </p>
      )}

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            이메일 <span className="text-danger">*</span>
          </label>
          <input
            type="email"
            placeholder="name@company.com"
            {...register("email")}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-primary"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-700">
              비밀번호 <span className="text-danger">*</span>
            </label>
            <Link
              href="/auth/find-pw"
              className="text-xs font-semibold text-primary hover:underline"
            >
              비밀번호 찾기
            </Link>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            {...register("password")}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-primary"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          {isPending ? "로그인 중…" : "로그인"}
        </button>
      </form>

      <AuthDivider>또는</AuthDivider>

      <GoogleButton
        label="Google 계정으로 로그인"
        onClick={() => signInWithGoogle()}
      />

      <p className="mt-8 text-center text-sm text-slate-500">
        아직 계정이 없으신가요?{" "}
        <Link
          href="/auth/signup"
          className="font-semibold text-primary hover:underline"
        >
          회원가입
        </Link>
      </p>

      <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-center text-xs text-slate-500">
        기존 RESTUDIO 회원은 동일한 계정으로 바로 로그인됩니다.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm_ />
    </Suspense>
  );
}
