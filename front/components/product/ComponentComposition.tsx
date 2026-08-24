"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Trash2 } from "lucide-react";
import { cx } from "@/components/primitives";
import { Modal } from "@/components/ui/Dialog";
import { GENERIC_ERROR, useToast } from "@/components/ui/Toast";
import TypePickerModal from "@/components/component/TypePickerModal";
import { getPpwrComponentService } from "@/src/shared/api";

const LEVELS = [1, 2, 3] as const;
type Level = (typeof LEVELS)[number];

const LEVEL_DESC: Record<Level, string> = {
  1: "제품과 직접 접촉하는 포장재입니다.",
  2: "1차 포장재를 묶거나 감싸는 포장재입니다.",
  3: "운송·보관 단위의 포장재입니다.",
};

/**
 * 부품 구성 (시안 '새 제품 등록 → 부품 정보' 탭).
 *
 * 부품을 붙이려면 ComponentInstance 에 product_id 가 필요하다. 따라서 제품이 아직
 * 저장되지 않았으면(productId == null) 두 버튼을 잠그고 먼저 저장하라고 안내한다.
 *
 * '새 부품 등록'은 부품 관리와 **같은 프로세스**다 — 유형 선택 모달 → 부품 등록 폼.
 * 다만 여기서 들어가면 저장 직후 이 제품에 자동으로 붙도록 attachTo/returnTo 를 넘긴다.
 */
export default function ComponentComposition({
  productId,
  returnTo,
}: {
  productId: number | null;
  /** 새 부품 등록을 마친 뒤 돌아올 경로 */
  returnTo: string;
}) {
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();
  const [level, setLevel] = useState<Level>(1);
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [q, setQ] = useState("");

  const { data: instances = [] } = useQuery({
    queryKey: ["ppwr", "instances", productId],
    queryFn: () => getPpwrComponentService().listInstances(productId as number),
    enabled: productId != null,
  });

  const { data: library = [] } = useQuery({
    queryKey: ["ppwr", "componentLibrary"],
    queryFn: () => getPpwrComponentService().listLibrary(),
    enabled: libraryOpen,
  });

  const attach = useMutation({
    mutationFn: (componentId: number) =>
      getPpwrComponentService().addInstance(productId as number, componentId, {
        packaging_level: level,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ppwr", "instances", productId] });
      toast.show("success", "부품을 추가했습니다.");
      setLibraryOpen(false);
    },
    onError: (e) => toast.show("danger", e instanceof Error ? e.message : GENERIC_ERROR),
  });

  const detach = useMutation({
    mutationFn: (instanceId: number) => getPpwrComponentService().removeInstance(instanceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ppwr", "instances", productId] });
      toast.show("success", "부품을 제거했습니다.");
    },
    onError: (e) => toast.show("danger", e instanceof Error ? e.message : GENERIC_ERROR),
  });

  const atLevel = instances.filter((i) => (i.packaging_level ?? 1) === level);
  const locked = productId == null;
  const hits = q.trim()
    ? library.filter((m) => `${m.name} ${m.type ?? ""}`.toLowerCase().includes(q.trim().toLowerCase()))
    : library;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-ink">부품 구성</h2>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={locked}
            onClick={() => setTypePickerOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-soft disabled:bg-slate-200 disabled:text-slate-400"
          >
            <Plus className="h-4 w-4" /> 새 부품 등록
          </button>
          <button
            type="button"
            disabled={locked}
            onClick={() => setLibraryOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:border-slate-200 disabled:text-slate-300"
          >
            <Search className="h-4 w-4" /> 기존 부품 추가
          </button>
        </div>
      </div>

      {locked && (
        <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
          제품을 먼저 저장해야 부품을 붙일 수 있습니다. 제품 정보 탭에서 저장해 주세요.
        </p>
      )}

      <div className="mt-4 flex overflow-hidden rounded-lg border border-slate-200">
        {LEVELS.map((l) => {
          const count = instances.filter((i) => (i.packaging_level ?? 1) === l).length;
          return (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              className={cx(
                "flex-1 border-r border-slate-200 py-3 text-sm font-semibold last:border-r-0",
                l === level ? "bg-slate-100 text-ink" : "bg-white text-slate-400 hover:bg-slate-50",
              )}
            >
              {l}차 포장재 ({count})
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-sm text-slate-500">{LEVEL_DESC[level]}</p>

      {atLevel.length === 0 ? (
        <p className="mt-3 rounded-lg bg-slate-50 py-14 text-center text-sm text-slate-400">
          아직 등록된 {level}차 포장재가 없습니다
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {atLevel.map((i) => (
            <li key={i.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
              <span className="h-10 w-10 shrink-0 rounded bg-slate-100" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">
                  {i.master?.name ?? "이름 없는 부품"}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {i.master?.type ?? "유형 미지정"}
                  {i.weight_per_unit != null && ` · ${i.weight_per_unit}g`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => detach.mutate(i.id)}
                aria-label={`${i.master?.name ?? "부품"} 제거`}
                className="rounded-lg p-2 text-slate-300 hover:bg-red-50 hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 새 부품 등록 — 부품 관리와 같은 유형 선택 → 등록 폼 */}
      <TypePickerModal
        open={typePickerOpen}
        onClose={() => setTypePickerOpen(false)}
        onSelect={(typeKey) => {
          const qs = new URLSearchParams({
            type: typeKey,
            attachTo: String(productId),
            level: String(level),
            returnTo,
          });
          router.push(`/app/components/new?${qs.toString()}`);
        }}
      />

      {/* 기존 부품 추가 */}
      <Modal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        title={`기존 부품 추가 — ${level}차 포장재`}
        width="max-w-xl"
      >
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="부품명, 유형 검색"
            className="w-full text-sm outline-none placeholder:text-slate-300"
          />
        </div>
        <ul className="mt-3 max-h-72 overflow-y-auto">
          {hits.length === 0 && (
            <li className="py-10 text-center text-sm text-slate-400">등록된 부품이 없습니다.</li>
          )}
          {hits.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                disabled={attach.isPending}
                onClick={() => attach.mutate(m.id)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-slate-50 disabled:opacity-60"
              >
                <span className="h-9 w-9 shrink-0 rounded bg-slate-100" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">{m.name}</span>
                  <span className="block text-xs text-slate-400">{m.type ?? "유형 미지정"}</span>
                </span>
                <Plus className="h-4 w-4 shrink-0 text-slate-400" />
              </button>
            </li>
          ))}
        </ul>
      </Modal>
    </section>
  );
}
