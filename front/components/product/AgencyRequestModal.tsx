"use client";

import { useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import { Modal } from "@/components/ui/Dialog";
import { GENERIC_ERROR, useToast } from "@/components/ui/Toast";
import { getSupabaseClient } from "@/src/shared/api";
import { EU_COUNTRIES, EU_MARKET_STATUS } from "@/src/lib/ppwr-product-spec";

/**
 * 제품 등록 대행 신청 모달.
 *
 * 시안: 요청 수량 · 등록 요청 내용 · 첨부파일 · EU 시장 출시 형태 / 출시 예정일 / 판매 예정국가.
 * 저장은 ppwr.ConsultationRequest 에 request_type='product_registration_agency' 로 남긴다.
 *
 * ⚠️ 첨부파일은 신청서에 붙는 파일이라 EvidenceDocument(제품/부품에 매달림)에 넣을 수 없다.
 *    전용 테이블이 없어 지금은 파일명만 요청 내용에 적어 보내고, 실제 업로드는 보류한다.
 */
export default function AgencyRequestModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [quantity, setQuantity] = useState("1");
  const [detail, setDetail] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [euStatus, setEuStatus] = useState("");
  const [euDate, setEuDate] = useState("");
  const [euCountries, setEuCountries] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setQuantity("1");
    setDetail("");
    setFiles([]);
    setEuStatus("");
    setEuDate("");
    setEuCountries([]);
    setError(null);
  }

  async function submit() {
    setError(null);
    if (!quantity.trim() || Number(quantity) < 1) {
      setError("제품 등록 요청 수량을 입력해 주세요.");
      return;
    }
    if (!detail.trim()) {
      setError("등록 요청 내용을 입력해 주세요.");
      return;
    }
    setSaving(true);
    try {
      const supabase = getSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");
      const { data: me } = await supabase.from("User").select("id").eq("auth_id", user.id).single();
      if (!me) throw new Error("연결된 RESTUDIO 유저 정보를 찾을 수 없습니다.");

      // 신청서 전용 컬럼이 없어 구조화된 값들을 message 앞머리에 정리해 붙인다
      const header = [
        `요청 수량: ${quantity}개`,
        euStatus && `EU 시장 출시 형태: ${euStatus}`,
        euDate && `EU 출시 예정일: ${euDate}`,
        euCountries.length > 0 && `EU 판매 예정국가: ${euCountries.join(", ")}`,
        files.length > 0 && `첨부 예정 파일: ${files.map((f) => f.name).join(", ")}`,
      ]
        .filter(Boolean)
        .join("\n");

      const { error: insErr } = await supabase
        .schema("ppwr")
        .from("ConsultationRequest")
        .insert({
          owner_user_id: me.id,
          request_type: "product_registration_agency",
          status: "requested",
          message: `${header}\n\n${detail.trim()}`,
        });
      if (insErr) throw new Error(insErr.message);

      toast.show("success", "성공적으로 신청했습니다.");
      reset();
      onClose();
    } catch (e) {
      const message = e instanceof Error ? e.message : GENERIC_ERROR;
      setError(message);
      toast.show("danger", message);
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
      title="제품 등록 대행 신청"
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
            disabled={saving}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {saving ? "신청 중…" : "신청"}
          </button>
        </>
      }
    >
      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-danger">
          {error}
        </p>
      )}

      <div className="space-y-5">
        <div>
          <Label required>제품 등록 요청 수량</Label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <Label required>등록 요청 내용</Label>
          <textarea
            rows={5}
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="제품 정보를 자유롭게 입력해주세요..."
            className={inputCls}
          />
        </div>

        <div>
          <Label>첨부파일</Label>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Upload className="h-4 w-4 text-amber-500" /> 파일 첨부
          </button>
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              const picked = Array.from(e.target.files ?? []);
              e.target.value = "";
              if (picked.length) setFiles((prev) => [...prev, ...picked]);
            }}
          />
          {files.length > 0 && (
            <>
              <div className="mt-3 flex flex-wrap gap-2">
                {files.map((f, i) => (
                  <span
                    key={`${f.name}-${i}`}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-ink"
                  >
                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                    {f.name}
                    <button
                      type="button"
                      aria-label={`${f.name} 제거`}
                      onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      className="rounded-full bg-ink/80 p-0.5 text-white hover:bg-ink"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                신청 시 파일명만 함께 전달됩니다. 실제 파일 전송은 담당자가 회신 메일로 안내합니다.
              </p>
            </>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label>EU 시장 출시 형태</Label>
            <select value={euStatus} onChange={(e) => setEuStatus(e.target.value)} className={`${inputCls} bg-white`}>
              <option value="">선택</option>
              {EU_MARKET_STATUS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>EU 출시 예정일</Label>
            <input type="date" value={euDate} onChange={(e) => setEuDate(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div>
          <Label>EU 판매 예정국가</Label>
          <div className="flex flex-wrap gap-1.5 rounded-lg border border-slate-300 p-2.5">
            {EU_COUNTRIES.map((c) => {
              const on = euCountries.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() =>
                    setEuCountries((prev) => (on ? prev.filter((x) => x !== c) : [...prev, c]))
                  }
                  className={
                    "rounded-md px-2.5 py-1 text-xs font-semibold " +
                    (on ? "bg-primary text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200")
                  }
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none placeholder:text-slate-300 focus:border-primary";

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
      {children} {required && <span className="text-danger">*</span>}
    </label>
  );
}
