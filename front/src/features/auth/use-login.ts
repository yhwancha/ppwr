"use client";

import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { getAuthService } from "@/src/shared/api";
import { BASE_PATH } from "@/src/shared/base-path";

export const LoginSchema = z.object({
  email: z.string().email("이메일 형식이 올바르지 않습니다."),
  password: z.string().min(1, "비밀번호를 입력하세요."),
});

export type LoginForm = z.infer<typeof LoginSchema>;

export function useLogin() {
  return useMutation({
    mutationFn: async (params: LoginForm) => {
      const { email, password } = LoginSchema.parse(params);
      return await getAuthService().signInEmailWithPassword(email, password);
    },
  });
}

export async function signInWithGoogle() {
  const redirectTo = `${window.location.origin}${BASE_PATH}/auth/callback`;
  await getAuthService().signInWithOauth("google", redirectTo);
}
