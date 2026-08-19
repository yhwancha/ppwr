/**
 * PPWR 어시스턴트 대화 엔드포인트.
 *
 * 흐름: 로그인 확인 → UIMessage[] 를 모델 메시지로 변환 → streamText → UI 메시지 스트림.
 * LLM 접속은 `openai()` 프로바이더 하나만 거친다(ADR-0066 — 키는 Edge 게이트웨이 뒤에 있다).
 *
 * 이 라우트는 `/app` 밖이라 미들웨어의 인증 게이트가 걸리지 않는다 — 여기서 직접 막는다.
 * 지식베이스 검색·대화 영속·리드 수집은 아직 없다(정보 Q&A 1차 범위).
 */

import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { openai } from "@/src/shared/llm/openai-provider";
import { PPWR_SYSTEM_PROMPT } from "@/src/features/chat/prompt";
import { createClient } from "@/src/shared/supabase/server";

const MODEL_ID = "gpt-5.4";

/** 한 요청이 물고 갈 수 있는 벽시계 상한. 넘으면 스트림이 끊기고 클라가 에러를 표시한다. */
const LLM_TIMEOUT_MS = 60_000;

/** 프롬프트 폭주 방지 — 최근 턴만 모델에 넘긴다(클라가 전체 히스토리를 보내더라도). */
const MAX_MESSAGES = 40;

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("unauthorized", { status: 401 });
  }

  let messages: UIMessage[];
  try {
    const body = (await req.json()) as { messages?: UIMessage[] };
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return new Response("messages 가 비어 있습니다", { status: 400 });
    }
    messages = body.messages.slice(-MAX_MESSAGES);
  } catch {
    return new Response("잘못된 요청 본문입니다", { status: 400 });
  }

  const result = streamText({
    model: openai()(MODEL_ID),
    system: PPWR_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 2000,
    // gpt-5 계열은 reasoning 이 켜지면 temperature 를 거부한다 — 노브로만 제어한다.
    providerOptions: {
      openai: { textVerbosity: "low", reasoningEffort: "low" },
    },
    abortSignal: AbortSignal.timeout(LLM_TIMEOUT_MS),
  });

  return result.toUIMessageStreamResponse();
}
