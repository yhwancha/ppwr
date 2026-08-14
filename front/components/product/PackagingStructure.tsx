"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Info, Layers } from "lucide-react";
import { getPpwrPackagingService } from "@/src/shared/api";
import type { PackagingSetPatch } from "@/src/lib/ppwr-packaging-service";

const DATA_STATUS: { v: string; l: string }[] = [
  { v: "provided", l: "자료 있음" },
  { v: "unknown", l: "모름" },
  { v: "need_check", l: "확인 필요" },
  { v: "not_available", l: "자료 없음" },
];

const LEVELS = [
  { key: "has_primary" as const, label: "1차 포장", desc: "제품에 직접 닿는 포장 (용기·병·튜브)" },
  { key: "has_secondary" as const, label: "2차 포장", desc: "1차 포장을 담는 단위 (단상자·슬리브)" },
  { key: "has_tertiary" as const, label: "3차 포장", desc: "운송·물류 단위 (박스·팔레트)" },
];

export default function PackagingStructure({ productId }: { productId: number }) {
  const qc = useQueryClient();
  const key = ["ppwr", "packaging", productId];

  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => getPpwrPackagingService().getByProduct(productId),
  });

  const [f, setF] = useState<PackagingSetPatch>({
    has_primary: true,
    has_secondary: false,
    has_tertiary: false,
    total_packaging_weight: null,
    packaging_to_product_ratio: null,
    minimization_status: "unknown",
    recyclability_status: "unknown",
  });
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setF({
        has_primary: data.has_primary,
        has_secondary: data.has_secondary,
        has_tertiary: data.has_tertiary,
        total_packaging_weight: data.total_packaging_weight,
        packaging_to_product_ratio: data.packaging_to_product_ratio,
        minimization_status: data.minimization_status,
        recyclability_status: data.recyclability_status,
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () => getPpwrPackagingService().save(productId, f),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key });
      setMsg("저장되었습니다.");
      setTimeout(() => setMsg(null), 2000);
    },
    onError: (e) => setMsg(e instanceof Error ? e.message : "저장에 실패했습니다."),
  });

  const set = <K extends keyof PackagingSetPatch>(k: K, v: PackagingSetPatch[K]) =>
    setF((s) => ({ ...s, [k]: v }));
  const numOrNull = (v: string) => (v.trim() === "" ? null : Number(v));

  return (
    <section className="mt-4 grid gap-6 rounded-2xl border border-slate-200 bg-white p-8 md:grid-cols-[300px_1fr]">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
          <Layers className="h-4 w-4 text-primary" /> 포장 구조
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          제품의 1·2·3차 포장 단계와 포장 최소화·재활용성 상태입니다. PPWR 과대포장·재활용성 요건 판단에 사용됩니다.
        </p>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <p className="text-sm text-slate-400">불러오는 중…</p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              {LEVELS.map((lv) => {
                const on = Boolean(f[lv.key]);
                return (
                  <button
                    key={lv.key}
                    type="button"
                    onClick={() => set(lv.key, !on)}
                    className={
                      "rounded-xl border p-4 text-left transition " +
                      (on
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-slate-200 hover:border-slate-300")
                    }
                  >
                    <div className="flex items-center justify-between">
                      <span className={"text-sm font-semibold " + (on ? "text-primary" : "text-slate-600")}>
                        {lv.label}
                      </span>
                      <span
                        className={
                          "h-4 w-4 rounded-full border " +
                          (on ? "border-primary bg-primary" : "border-slate-300")
                        }
                      />
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{lv.desc}</p>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label>포장 총중량 (g)</Label>
                <input
                  type="number"
                  value={f.total_packaging_weight ?? ""}
                  onChange={(e) => set("total_packaging_weight", numOrNull(e.target.value))}
                  placeholder="0.00"
                  className={inputCls}
                />
              </div>
              <div>
                <Label hint>포장/제품 중량 비율</Label>
                <input
                  type="number"
                  value={f.packaging_to_product_ratio ?? ""}
                  onChange={(e) => set("packaging_to_product_ratio", numOrNull(e.target.value))}
                  placeholder="예: 0.15"
                  className={inputCls}
                />
              </div>
              <StatusSelect
                label="포장 최소화 상태"
                value={f.minimization_status ?? "unknown"}
                onChange={(v) => set("minimization_status", v)}
              />
              <StatusSelect
                label="재활용성 상태"
                value={f.recyclability_status ?? "unknown"}
                onChange={(v) => set("recyclability_status", v)}
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => save.mutate()}
                disabled={save.isPending}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
              >
                {save.isPending ? "저장 중…" : "포장 구조 저장"}
              </button>
              {msg && <span className="text-sm text-slate-500">{msg}</span>}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none placeholder:text-slate-300 focus:border-primary";

function Label({ children, hint }: { children: React.ReactNode; hint?: boolean }) {
  return (
    <label className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-700">
      {children}
      {hint && <Info className="h-3.5 w-3.5 text-slate-300" />}
    </label>
  );
}

function StatusSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls + " bg-white"}
      >
        {DATA_STATUS.map((s) => (
          <option key={s.v} value={s.v}>
            {s.l}
          </option>
        ))}
      </select>
    </div>
  );
}
