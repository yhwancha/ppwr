// ADR-0066 — ppwr 의 OpenAI 프로바이더 단일 소스.
//
// web/admin 과 같은 규약이다: `OPENAI_BASE_URL` 이 있으면 Supabase Edge LLM 게이트웨이를
// 경유하고 자격은 `LLM_GATEWAY_TOKEN` 으로 넘긴다. 없으면 SDK 기본값(직통)이라, env 를
// 켜기 전까지 동작이 바뀌지 않는다.
//
// 토큰 이름을 `OPENAI_API_KEY` 로 쓰지 않는 이유는 감사 기준 때문이다 — 앱 컨테이너 env 에
// `OPENAI_API_KEY` 가 보이면 그게 진짜 키인지 게이트웨이 토큰인지 구분할 수 없다.
//
// 생성은 첫 **사용** 시점까지 미룬다. `next build` 의 page-data 수집이 라우트 모듈을 import
// 하는 것만으로 throw 하면 (base 만 있고 토큰이 없는 조합이 빌드 환경에 흔하다) 모든 배포가
// 깨진다 — web 이 2026-07-28 에 실제로 겪은 실패다.

import { createOpenAI } from "@ai-sdk/openai";

function buildProvider() {
  const base = process.env.OPENAI_BASE_URL?.trim();
  if (!base) {
    // 직통 — baseURL 기본값 + `OPENAI_API_KEY` env 를 SDK 에 위임.
    return createOpenAI({});
  }
  const token = process.env.LLM_GATEWAY_TOKEN?.trim();
  if (!token) {
    // 조용히 직통으로 폴백하면 "게이트웨이로 옮겼다"고 믿는 채 계속 원시 키를 쓰게 된다.
    throw new Error("LLM_GATEWAY_TOKEN 미설정 — OPENAI_BASE_URL 이 설정된 경우 필수");
  }
  return createOpenAI({ baseURL: base, apiKey: token });
}

type Provider = ReturnType<typeof createOpenAI>;

let cached: Provider | null = null;

export function openai(): Provider {
  if (!cached) cached = buildProvider();
  return cached;
}

/** 게이트웨이 경유 중인지(진단·로깅용). */
export function isViaLlmGateway(): boolean {
  return Boolean(process.env.OPENAI_BASE_URL?.trim());
}
