import { NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@/src/shared/llm/openai-provider";
import { IMPORT_FIELDS, fieldKey } from "@/src/lib/ppwr-csv-mapping";

/** 헤더 매핑은 분류 작업이라 저비용 모델로 충분하다 */
const MODEL_ID = "gpt-4o-mini";

/**
 * CSV 헤더 매핑 AI 보강.
 *
 * 규칙 기반(heuristicMap)이 못 붙인 헤더만 받아서 어떤 필드인지 판단한다.
 * 전부 넘기지 않는 이유는 두 가지다 — 토큰이 아깝고, 이미 확실히 붙은 것을
 * AI 가 뒤집을 이유가 없다.
 *
 * ⚠️ 키가 없으면 501 이 아니라 200 + 빈 매핑을 준다. 호출부가 "AI 없음"을 오류로
 *    다루지 않고 규칙 결과를 그대로 쓰게 하기 위해서다. CSV 업로드는 AI 가 없어도
 *    동작해야 하는 기능이다.
 */
export const runtime = "nodejs";

type Body = {
  /** 아직 못 붙인 헤더 */
  headers?: string[];
  /** 판단 근거로 쓸 표본 (헤더당 최대 3행) */
  samples?: Record<string, string[]>;
};

function aiConfigured() {
  return Boolean(
    process.env.OPENAI_API_KEY?.trim() ||
      (process.env.OPENAI_BASE_URL?.trim() && process.env.LLM_GATEWAY_TOKEN?.trim()),
  );
}

export async function POST(req: Request) {
  const { headers = [], samples = {} } = (await req.json()) as Body;

  if (headers.length === 0) {
    return NextResponse.json({ mapping: {}, by: "none" });
  }
  if (!aiConfigured()) {
    // 키 미설정 — 규칙 결과로 충분하다는 신호를 준다
    return NextResponse.json({ mapping: {}, by: "unconfigured" });
  }

  const catalog = IMPORT_FIELDS.map(
    (f) => `- ${fieldKey(f)} : ${f.header} (${f.kind}) 예) ${f.example}`,
  ).join("\n");

  const cols = headers
    .map((h) => `- "${h}" 표본: ${(samples[h] ?? []).slice(0, 3).join(" | ") || "(빈 값)"}`)
    .join("\n");

  try {
    const { text } = await generateText({
      model: openai()(MODEL_ID),
      temperature: 0,
      system:
        "너는 CSV 헤더를 정해진 제품 필드에 매핑한다. " +
        "반드시 JSON 오브젝트 하나만 출력한다. 키는 CSV 헤더 원문, 값은 필드 키 또는 null. " +
        "확신이 없으면 null 을 쓴다. 목록에 없는 필드 키를 지어내지 않는다.",
      prompt:
        `사용 가능한 필드:\n${catalog}\n\n` +
        `매핑할 CSV 헤더와 표본 값:\n${cols}\n\n` +
        `JSON 만 출력:`,
    });

    const json = text.match(/\{[\s\S]*\}/)?.[0];
    if (!json) return NextResponse.json({ mapping: {}, by: "ai-noparse" });

    const raw = JSON.parse(json) as Record<string, unknown>;
    const valid = new Set(IMPORT_FIELDS.map(fieldKey));
    const mapping: Record<string, string> = {};
    for (const [h, v] of Object.entries(raw)) {
      if (typeof v === "string" && valid.has(v)) mapping[h] = v;
    }
    return NextResponse.json({ mapping, by: "ai" });
  } catch (e) {
    // AI 실패로 업로드 자체를 막지 않는다
    console.error("[csv-mapping] AI 매핑 실패", e);
    return NextResponse.json({ mapping: {}, by: "ai-error" });
  }
}
