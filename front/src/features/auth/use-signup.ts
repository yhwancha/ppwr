"use client";

import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { getSupabaseClient } from "@/src/shared/api";

export const SignupSchema = z
  .object({
    name: z.string().min(1, "이름을 입력하세요."),
    company: z.string().optional(),
    email: z.string().email("이메일 형식이 올바르지 않습니다."),
    password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirm"],
  });

export type SignupForm = z.infer<typeof SignupSchema>;

/**
 * 회원가입 = ① auth.signUp (auth.users 생성) ② public.User row 생성.
 * (RESTUDIO는 auth.users→User 자동 트리거가 없으므로 앱에서 직접 insert)
 * 로컬은 enable_confirmations=false 라 가입 즉시 세션이 생겨 바로 로그인 상태가 된다.
 */
export function useSignup() {
  return useMutation({
    mutationFn: async (input: SignupForm) => {
      const { name, email, password } = SignupSchema.parse(input);
      const sb = getSupabaseClient();

      const { data, error } = await sb.auth.signUp({ email, password });
      if (error) throw new Error(error.message);

      const authId = data.user?.id;
      if (!authId) throw new Error("가입에 실패했습니다. 다시 시도해 주세요.");

      const today = new Date().toISOString().slice(0, 10);
      const { error: userErr } = await sb.from("User").insert({
        auth_id: authId,
        email,
        name,
        role: "user",
        created_at: today,
        updated_at: today,
      });
      // 이미 있는 계정(중복 가입 등)은 무시, 그 외 에러는 표면화
      if (userErr && !/duplicate|unique/i.test(userErr.message)) {
        throw new Error("회원 정보 저장에 실패했습니다: " + userErr.message);
      }

      return data.user;
    },
  });
}
