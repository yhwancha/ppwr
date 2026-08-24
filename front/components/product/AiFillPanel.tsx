"use client";

import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Send, Sparkles, Trash2 } from "lucide-react";
import { cx } from "@/components/primitives";

export type AiFillAction = "example" | "clear";

type Message = { from: "bot" | "user"; text: string };

/**
 * AI 내용 입력 도우미 (시안 우측 하단 패널).
 *
 * ⚠️ 대화형 입력(자유 문장·사진 판독)은 아직 붙일 LLM 엔드포인트가 없다.
 *    지금 실제로 도는 것은 백엔드가 필요 없는 두 동작뿐이다:
 *      · 예시 내용 채우기 — EXAMPLE_PRODUCT 를 폼에 밀어넣는다
 *      · 내용 모두 지우기 — 폼을 비운다
 *    나머지(사진 판독·자유 입력)는 눌리지 않게 두고 준비 중임을 명시한다.
 *    엔드포인트가 생기면 onSend/onPhoto 를 받아 이 자리에 연결하면 된다.
 */
export default function AiFillPanel({
  onAction,
}: {
  /** 동작을 실행하고, 대화창에 남길 결과 문구를 돌려준다 */
  onAction: (action: AiFillAction) => string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function run(action: AiFillAction, label: string) {
    const result = onAction(action);
    setMessages((prev) => [...prev, { from: "user", text: label }, { from: "bot", text: result }]);
  }

  return (
    <section className="flex h-fit flex-col rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-base font-bold text-ink">AI 내용 입력 도우미</h2>

      <div ref={logRef} className="mt-4 h-64 space-y-2 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <p className="pt-2 text-xs leading-relaxed text-slate-300">
            아래 동작을 누르면 왼쪽 제품정보가 채워지고, 무엇이 바뀌었는지 여기에 남습니다.
          </p>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={cx("flex", m.from === "user" ? "justify-end" : "justify-start")}>
              <p
                className={cx(
                  "max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed",
                  m.from === "user" ? "bg-ink text-white" : "bg-slate-100 text-slate-600",
                )}
              >
                {m.text}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 p-3">
        <div className="flex flex-wrap gap-1.5">
          <QuickAction icon={Sparkles} label="예시 내용 채우기" onClick={() => run("example", "예시 내용 채우기")} />
          <QuickAction
            icon={ImageIcon}
            label="사진으로 내용 입력"
            disabled
            title="사진 판독은 준비 중입니다"
          />
          <QuickAction icon={Trash2} label="내용 모두 지우기" onClick={() => run("clear", "내용 모두 지우기")} />
        </div>

        <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
          왼쪽 제품정보를 입력 도우미와 함께 채워넣을 수 있어요.
        </p>

        <div className="mt-3 flex items-end gap-2">
          <textarea
            rows={2}
            disabled
            placeholder="자유 입력은 준비 중입니다"
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none placeholder:text-slate-300 disabled:bg-slate-50"
          />
          <button
            type="button"
            disabled
            aria-label="보내기"
            className="shrink-0 rounded-full bg-ink p-2 text-white disabled:bg-slate-200"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
  disabled,
  title,
}: {
  icon: typeof Sparkles;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 disabled:border-slate-200 disabled:text-slate-300 disabled:hover:bg-transparent"
    >
      <Icon className="h-3 w-3" />
      {label}
    </button>
  );
}
