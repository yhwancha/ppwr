"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { Modal } from "@/components/ui/Dialog";
import { GENERIC_ERROR, useToast } from "@/components/ui/Toast";
import { getPpwrProductService } from "@/src/shared/api";
import { encodeProductAttrs } from "@/src/lib/ppwr-product-attrs";
import { CSV_COLUMNS, csvTemplate, parseCsv } from "@/src/lib/ppwr-product-spec";
import type { PpwrProductCreateInput } from "@/src/lib/ppwr-product-service";

/**
 * 제품 일괄 등록 모달.
 *
 * ⚠️ 시안은 "XLS로 업로드"라고 쓰여 있지만 .xlsx/.xls 는 바이너리라 파서 의존성
 *    (SheetJS·exceljs 등)이 있어야 읽을 수 있고, ppwr-front 에는 아직 없다.
 *    지금은 CSV 만 실제로 파싱하고, 엑셀 파일을 고르면 CSV 로 저장해 달라고 안내한다.
 *    파서를 넣으면 read() 의 분기만 바꾸면 된다.
 *
 * ⚠️ 컬럼 스펙도 시안에 "템플릿 제작 필요"로만 표시되어 확정본이 없다.
 *    지금은 등록 폼 항목을 그대로 편 템플릿(ppwr-product-spec.CSV_COLUMNS)을 기준으로 파싱한다.
 *    헤더가 템플릿과 다르면 그 컬럼은 무시하고, 필수값이 빠진 행은 등록 전에 걸러 알려준다.
 */
export default function CsvUploadModal({
  open,
  onClose,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  onDone: (createdCount: number) => void;
}) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<PpwrProductCreateInput[]>([]);
  const [problems, setProblems] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  function reset() {
    setFileName(null);
    setRows([]);
    setProblems([]);
  }

  async function read(file: File) {
    reset();
    setFileName(file.name);
    if (/\.xlsx?$/i.test(file.name)) {
      setProblems([
        "엑셀(.xlsx/.xls) 파일은 아직 직접 읽지 못합니다. 엑셀에서 \"다른 이름으로 저장 → CSV UTF-8\" 로 내보낸 뒤 올려 주세요.",
      ]);
      return;
    }
    const text = await file.text();
    const table = parseCsv(text);
    if (table.length < 2) {
      setProblems(["헤더와 최소 1개 데이터 행이 필요합니다."]);
      return;
    }
    const header = table[0].map((h) => h.trim());
    const byHeader = new Map(CSV_COLUMNS.map((c) => [c.header, c]));
    const issues: string[] = [];
    const parsed: PpwrProductCreateInput[] = [];

    table.slice(1).forEach((line, i) => {
      const rowNo = i + 2; // 헤더가 1행
      const record: Record<string, unknown> = {};
      const attrs: Record<string, string> = {};

      header.forEach((h, ci) => {
        const spec = byHeader.get(h);
        if (!spec) return; // 템플릿에 없는 컬럼은 무시
        const raw = (line[ci] ?? "").trim();
        if (raw === "") return;
        const value =
          spec.kind === "number"
            ? Number(raw)
            : spec.kind === "yesno"
              ? raw === "예" || raw.toLowerCase() === "y" || raw.toLowerCase() === "true"
              : raw;
        if (spec.kind === "number" && Number.isNaN(value as number)) {
          issues.push(`${rowNo}행 "${h}": 숫자가 아닙니다 (${raw})`);
          return;
        }
        if (spec.column) record[spec.column] = value;
        else if (spec.attrKey) attrs[spec.attrKey] = String(raw);
      });

      for (const req of CSV_COLUMNS.filter((c) => c.required)) {
        const v = req.column ? record[req.column] : attrs[req.attrKey ?? ""];
        if (v == null || String(v).trim() === "") {
          issues.push(`${rowNo}행: 필수값 "${req.header}" 이(가) 비어 있습니다`);
        }
      }

      const memo = encodeProductAttrs(attrs);
      if (memo) record.memo = memo;
      parsed.push(record as PpwrProductCreateInput);
    });

    setProblems(issues);
    setRows(issues.length ? [] : parsed);
  }

  async function submit() {
    if (rows.length === 0) return;
    setSaving(true);
    try {
      const created = await getPpwrProductService().createMany(rows);
      toast.show("success", `${created.length}개 제품을 성공적으로 등록했습니다.`);
      reset();
      onDone(created.length);
    } catch (e) {
      toast.show("danger", e instanceof Error ? e.message : GENERIC_ERROR);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="XLS로 제품 일괄 등록"
      width="max-w-xl"
      footer={
        <>
          <button
            type="button"
            onClick={() => {
              reset();
              onClose();
            }}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={saving || rows.length === 0}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:bg-slate-100 disabled:text-slate-400"
          >
            {saving ? "등록 중…" : rows.length > 0 ? `${rows.length}개 등록` : "등록"}
          </button>
        </>
      }
    >
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 px-6 py-10 text-center hover:border-primary"
      >
        <Upload className="h-6 w-6 text-slate-400" />
        <span className="text-sm font-semibold text-ink">{fileName ?? "파일 선택"}</span>
        <span className="text-xs text-slate-400">템플릿을 내려받아 채운 뒤 CSV 로 올려주세요</span>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void read(file);
        }}
      />

      <button
        type="button"
        onClick={downloadTemplate}
        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        <Download className="h-4 w-4" /> 템플릿 다운로드
      </button>

      {problems.length > 0 && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-semibold text-danger">
            CSV 내에 제품 별 필수 입력값이 모두 입력되지 않았습니다.
          </p>
          <ul className="mt-2 max-h-40 list-disc space-y-0.5 overflow-y-auto pl-5 text-xs text-danger">
            {problems.slice(0, 20).map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
          {problems.length > 20 && (
            <p className="mt-1 text-xs text-danger">…외 {problems.length - 20}건</p>
          )}
        </div>
      )}

      {rows.length > 0 && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {rows.length}개 제품을 등록할 준비가 되었습니다.
        </p>
      )}
    </Modal>
  );
}

/** 브라우저에서 템플릿을 내려받는다 (서버 왕복 없이 Blob) */
function downloadTemplate() {
  const blob = new Blob([csvTemplate()], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ppwr-제품등록-템플릿.csv";
  a.click();
  URL.revokeObjectURL(url);
}
