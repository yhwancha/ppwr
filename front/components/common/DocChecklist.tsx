"use client";

import { useRef } from "react";
import { Download, FileText, Upload, X } from "lucide-react";
import { cx } from "@/components/primitives";
import { DOC_STATE_CLASS, DOC_STATE_LABEL, type DocState } from "@/src/lib/ppwr-component-attrs";
import { ACCEPTED_EXT, MAX_FILES_PER_DOC } from "@/src/lib/ppwr-evidence-service";
import type { SpecDoc } from "@/src/lib/ppwr-component-spec";

/** 체크리스트 한 줄에 매달린 파일 1개 */
export type DocFile = {
  /** 삭제·다운로드 식별자. 저장된 문서는 EvidenceDocument.id, 아직 안 올라간 건 로컬 키 */
  key: string;
  name: string;
  size: number;
  /** 아직 서버에 안 올라간 파일이면 다운로드 불가 */
  storagePath?: string | null;
};

export type DocEntry = {
  doc: SpecDoc;
  state: DocState;
  files: DocFile[];
};

function sizeLabel(bytes: number): string {
  if (bytes < 1024) return `${bytes}b`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}kb`;
  return `${(bytes / 1024 / 1024).toFixed(1)}mb`;
}

const ACCEPT = ACCEPTED_EXT.map((e) => `.${e}`).join(",");

/**
 * 첨부 문서 체크리스트.
 *
 * 상태 배지(미제출·검토 대기·보완 필요·부적합·적합)는 관리자 검수 결과라 여기서 바꾸지 않는다.
 * 사용자는 파일을 올리고 지울 수만 있고, 올린 직후 상태는 '검토 대기'가 된다.
 */
export default function DocChecklist({
  entries,
  onPick,
  onRemove,
  onDownload,
  disabled,
  busyKey,
  variant = "card",
}: {
  entries: DocEntry[];
  onPick: (docName: string, files: File[]) => void;
  onRemove: (docName: string, file: DocFile) => void;
  onDownload?: (file: DocFile) => void;
  disabled?: boolean;
  /** 업로드/삭제 진행 중인 문서명 (버튼 잠금용) */
  busyKey?: string | null;
  /**
   * card  — 문서마다 테두리 카드 + 확인 목적 문구 (부품 등록·수정)
   * plain — 구분선으로만 나눈 목록 (제품 등록 시안)
   */
  variant?: "card" | "plain";
}) {
  return (
    <div className={variant === "plain" ? "divide-y divide-slate-100" : "space-y-3"}>
      {entries.map((entry) => (
        <DocRow
          key={entry.doc.name}
          entry={entry}
          onPick={onPick}
          onRemove={onRemove}
          onDownload={onDownload}
          disabled={disabled}
          busy={busyKey === entry.doc.name}
          variant={variant}
        />
      ))}
    </div>
  );
}

function DocRow({
  entry,
  onPick,
  onRemove,
  onDownload,
  disabled,
  busy,
  variant,
}: {
  entry: DocEntry;
  onPick: (docName: string, files: File[]) => void;
  onRemove: (docName: string, file: DocFile) => void;
  onDownload?: (file: DocFile) => void;
  disabled?: boolean;
  busy?: boolean;
  variant: "card" | "plain";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { doc, state, files } = entry;
  const full = files.length >= MAX_FILES_PER_DOC;
  const plain = variant === "plain";
  const badge = (
    <span className={cx("rounded-md px-2 py-0.5 text-[11px] font-bold", DOC_STATE_CLASS[state])}>
      {DOC_STATE_LABEL[state]}
    </span>
  );

  return (
    <div className={plain ? "py-5 first:pt-0 last:pb-0" : "rounded-xl border border-slate-200 p-5"}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-[220px] flex-1">
          <p className="text-sm font-bold text-ink">
            {doc.name} {!plain && doc.required && <span className="text-danger">(필수)</span>}
          </p>
          {plain ? (
            <div className="mt-1.5">{badge}</div>
          ) : (
            <p className="mt-1 text-xs leading-relaxed text-slate-400">확인 목적: {doc.purpose}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1.5">
          {!plain && badge}
          <button
            type="button"
            disabled={disabled || busy || full}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <Upload className="h-4 w-4 text-amber-500" />
            {busy ? "업로드 중…" : "파일 첨부"}
          </button>
          <p className="text-[10px] text-slate-400">
            최대 {MAX_FILES_PER_DOC}개 / 개당 최대 100MB / {ACCEPTED_EXT.join(",")}
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => {
              const picked = Array.from(e.target.files ?? []);
              // 같은 파일을 다시 고를 수 있도록 값 비우기
              e.target.value = "";
              if (picked.length === 0) return;
              onPick(doc.name, picked.slice(0, MAX_FILES_PER_DOC - files.length));
            }}
          />
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {files.map((f) => (
            <div
              key={f.key}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-400">
                <FileText className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="max-w-[160px] truncate text-xs font-semibold text-ink">{f.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">{sizeLabel(f.size)}</span>
                  {f.storagePath && onDownload && (
                    <button
                      type="button"
                      onClick={() => onDownload(f)}
                      aria-label={`${f.name} 다운로드`}
                      className="text-slate-400 hover:text-primary"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onRemove(doc.name, f)}
                  aria-label={`${f.name} 삭제`}
                  className="ml-1 rounded-full bg-ink/80 p-0.5 text-white hover:bg-ink"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
