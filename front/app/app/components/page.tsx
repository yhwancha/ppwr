"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Boxes, Plus, Search } from "lucide-react";
import Topbar from "@/components/app/Topbar";
import { getPpwrComponentService } from "@/src/shared/api";

const STATUS_LABEL: Record<string, string> = {
  provided: "자료있음",
  unknown: "모름",
  need_check: "확인필요",
  not_available: "자료없음",
};

export default function ComponentsPage() {
  const svc = getPpwrComponentService();
  const { data: library = [], isLoading } = useQuery({
    queryKey: ["ppwr", "component-library"],
    queryFn: () => svc.listLibrary(),
  });
  const { data: myId } = useQuery({
    queryKey: ["ppwr", "my-user-id"],
    queryFn: () => svc.currentUserId(),
  });

  const [tab, setTab] = useState<"all" | "mine" | "public">("all");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    return library.filter((c) => {
      if (tab === "mine" && c.owner_user_id == null) return false;
      if (tab === "public" && c.owner_user_id != null) return false;
      if (q && !`${c.name} ${c.type ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [library, tab, q]);

  const tabs: { key: "all" | "mine" | "public"; label: string }[] = [
    { key: "all", label: "전체" },
    { key: "mine", label: "내 부품" },
    { key: "public", label: "리베이션 공용" },
  ];

  return (
    <>
      <Topbar crumbs={[{ label: "부품 라이브러리" }]} />
      <div className="px-8 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-extrabold text-ink">
              <Boxes className="h-5 w-5 text-primary" /> 부품 라이브러리
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              포장 부품을 마스터로 관리하고 여러 제품에서 재사용합니다. 내가 등록한 부품과 리베이션 공용 부품을 함께 조회합니다.
            </p>
          </div>
          <Link href="/app/components/new" className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
            <Plus className="h-4 w-4" /> 부품 등록
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 py-5">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-sm font-semibold">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={"rounded-md px-3 py-1.5 " + (tab === t.key ? "bg-primary text-white" : "text-slate-500")}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="부품명·유형 검색"
              className="w-64 rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-slate-300 focus:border-primary"
            />
          </div>
        </div>

        {isLoading ? (
          <p className="py-10 text-center text-sm text-slate-400">불러오는 중…</p>
        ) : rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 py-16 text-center text-sm text-slate-400">
            부품이 없습니다. 우측 상단 “부품 등록”으로 추가하세요.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60 text-left text-xs font-semibold text-slate-400">
                  <th className="px-5 py-3">부품명</th>
                  <th className="px-3 py-3">유형</th>
                  <th className="px-3 py-3">구분</th>
                  <th className="px-3 py-3 text-right">재생원료(%)</th>
                  <th className="px-3 py-3">PFAS</th>
                  <th className="px-3 py-3">중금속</th>
                  <th className="px-3 py-3">퇴비화</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => {
                  const mine = myId != null && c.owner_user_id === myId;
                  return (
                    <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                      <td className="px-5 py-3">
                        <Link href={`/app/components/${c.id}`} className="font-semibold text-ink hover:text-primary">
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-slate-500">{c.type ?? "—"}</td>
                      <td className="px-3 py-3">
                        {c.owner_user_id == null ? (
                          <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600">공용</span>
                        ) : mine ? (
                          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">내 부품</span>
                        ) : (
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-400">기타</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">{c.recycled_content ?? "—"}</td>
                      <td className="px-3 py-3 text-slate-500">{STATUS_LABEL[c.pfas_status] ?? c.pfas_status}</td>
                      <td className="px-3 py-3 text-slate-500">{STATUS_LABEL[c.heavy_metal_status] ?? c.heavy_metal_status}</td>
                      <td className="px-3 py-3 text-slate-500">{STATUS_LABEL[c.compostability_status] ?? c.compostability_status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
