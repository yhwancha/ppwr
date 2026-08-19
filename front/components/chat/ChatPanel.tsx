"use client";

/**
 * PPWR 어시스턴트 패널 — 부품 등록/수정 화면 우측에 도킹되는 대화 UI.
 *
 * 현재 능력은 **정보 Q&A** 다. 폼을 대신 채우는 기능은 아직 없으므로 하단 칩도 폼 액션이
 * 아니라 대화 시작 질문이다(모델에 폼 write 권한이 없는데 "예시 내용 채우기" 버튼을 두면
 * 눌러도 아무 일이 안 일어난다).
 *
 * 대화는 메모리에만 있다 — 새로고침하면 사라진다. 영속은 후속.
 */

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Send } from "lucide-react";
import { BASE_PATH } from "@/src/shared/base-path";

/** 빈 상태에서 노출하는 대화 시작 질문. 클릭하면 그대로 사용자 발화로 전송된다. */
const STARTER_PROMPTS = [
  "이 부품에 필요한 증빙은?",
  "재활용성은 뭘로 판정하나요?",
  "PCR 함량은 어떻게 증빙하죠?",
];

/** UIMessage 의 텍스트 파트만 이어붙인다(도구·파일 파트는 아직 쓰지 않는다). */
function messageText(m: UIMessage): string {
  return m.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export default function ChatPanel({ className = "" }: { className?: string }) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: `${BASE_PATH}/api/chat` }),
  });

  const busy = status === "submitted" || status === "streaming";

  // 새 토큰이 흐를 때마다 바닥에 붙인다.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setInput("");
    void sendMessage({ text: trimmed });
  }

  return (
    <aside
      className={
        "flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-100/70 p-4 " + className
      }
    >
      <h2 className="px-1 pt-1 text-base font-bold text-ink">AI 어시스턴트</h2>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-1">
        {messages.length === 0 && (
          <p className="rounded-2xl rounded-tl-sm bg-slate-200/80 px-4 py-3 text-sm leading-relaxed text-slate-700">
            PPWR 규정이나 이 화면의 입력 항목에 대해 물어보세요. 필요한 증빙과 판정 기준을
            정리해 드립니다.
          </p>
        )}

        {messages.map((m) => {
          const text = messageText(m);
          if (!text) return null;
          return m.role === "user" ? (
            <p
              key={m.id}
              className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-ink px-4 py-3 text-sm leading-relaxed text-white"
            >
              {text}
            </p>
          ) : (
            <p
              key={m.id}
              className="max-w-[92%] whitespace-pre-wrap rounded-2xl rounded-tl-sm bg-slate-200/80 px-4 py-3 text-sm leading-relaxed text-slate-700"
            >
              {text}
            </p>
          );
        })}

        {status === "submitted" && (
          <p className="max-w-[92%] rounded-2xl rounded-tl-sm bg-slate-200/80 px-4 py-3 text-sm text-slate-400">
            답변을 준비하고 있어요…
          </p>
        )}

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-danger">
            답변을 받지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        {messages.length === 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {STARTER_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => submit(p)}
                disabled={busy}
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-primary/40 hover:bg-slate-50 disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            // Enter 전송 / Shift+Enter 줄바꿈. 한글 조합 중의 Enter 는 확정 키라 무시한다.
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit(input);
            }
          }}
          rows={3}
          placeholder="궁금한 내용을 입력하세요"
          className="w-full resize-none text-sm leading-relaxed text-slate-700 outline-none placeholder:text-slate-300"
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => submit(input)}
            disabled={busy || !input.trim()}
            aria-label="전송"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white transition hover:bg-primary-dark disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
