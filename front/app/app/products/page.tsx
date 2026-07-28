"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle, CheckCircle2, Clock, FileText, LayoutGrid, Package,
  PencilLine, Plus, RotateCcw, Search, Trash2, X, XCircle,
} from "lucide-react";
import Topbar from "@/components/app/Topbar";
import { getPpwrProductService } from "@/src/shared/api";

const STATUS = {
  draft: { label: "작성중", cls: "bg-slate-100 text-slate-500" },
  undiagnosed: { label: "미진단", cls: "bg-sky-50 text-sky-600" },
  needs_supplement: { label: "보완 필요", cls: "bg-amber-50 text-amber-700" },
  noncompliant: { label: "부적합", cls: "bg-red-50 text-red-600" },
  compliant: { label: "적합", cls: "bg-emerald-50 text-emerald-700" },
} as const;
type StatusKey = keyof typeof STATUS;

const tabs: { key: "all" | StatusKey; label: string; icon: React.ElementType }[] = [
  { key: "all", label: "전체", icon: LayoutGrid },
  { key: "draft", label: "작성중", icon: PencilLine },
  { key: "undiagnosed", label: "미진단", icon: Clock },
  { key: "needs_supplement", label: "보완 필요", icon: AlertTriangle },
  { key: "noncompliant", label: "부적합", icon: XCircle },
  { key: "compliant", label: "적합", icon: CheckCircle2 },
];
const filters = ["제품 카테고리", "제조 국가", "EU 판매 국가", "리포트 상태", "누락항목"];

export default function ProductsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"all" | StatusKey>("all");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Set<number>>(new Set());

  const { data, isLoading, error } = useQuery({
    queryKey: ["ppwr", "products"],
    queryFn: () => getPpwrProductService().list(),
  });

  const del = useMutation({
    mutationFn: async (ids: number[]) => {
      const svc = getPpwrProductService();
      await Promise.all(ids.map((id) => svc.remove(id)));
    },
    onSuccess: () => {
      setSel(new Set());
      qc.invalidateQueries({ queryKey: ["ppwr", "products"] });
    },
  });

  const rows = useMemo(() => {
    let r = data ?? [];
    if (tab !== "all") r = r.filter((p) => (p.status ?? "draft") === tab);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      r = r.filter((p) => p.name.toLowerCase().includes(s) || (p.sku ?? "").toLowerCase().includes(s));
    }
    return r;
  }, [data, tab, q]);

  function toggle(id: number) {
    setSel((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  return (
    <>
      <Topbar crumbs={[{ label: "제품 관리" }]} />
      <div className="px-8 pb-24">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold text-ink">제품 관리</h1>
          <div className="flex gap-2">
            <Link href="/app/products/new/agency" className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              제품 등록 대행 신청
            </Link>
            <Link href="/app/products/new" className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
              <Plus className="h-4 w-4" /> 제품 추가
            </Link>
          </div>
        </div>

        {/* 상태 탭 */}
        <div className="mt-5 flex flex-wrap gap-2">
          {tabs.map((t) => {
            const Icon = t.icon; const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={"inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors " +
                  (active ? "bg-primary text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}>
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* 검색 */}
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5">
          <Search className="h-4 w-4 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="제품명, 제품 ID, SKU 검색"
            className="w-full text-sm outline-none placeholder:text-slate-400" />
        </div>

        {/* 필터 */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <button key={f} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-500 hover:bg-slate-50">
              {f} <span className="text-slate-300">▾</span>
            </button>
          ))}
          <button className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-500 hover:bg-slate-50">
            <RotateCcw className="h-3.5 w-3.5" /> 필터 초기화
          </button>
        </div>

        <p className="mt-5 text-sm font-semibold text-slate-500">총 {rows.length}개</p>

        <div className="mt-3">
          {isLoading && <p className="py-10 text-center text-sm text-slate-400">불러오는 중…</p>}
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-danger">
              제품을 불러오지 못했습니다. 로그인 상태를 확인하세요.
            </p>
          )}
          {data && rows.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400"><Package className="h-6 w-6" /></span>
              <p className="mt-4 font-semibold text-ink">조건에 맞는 제품이 없습니다</p>
              <Link href="/app/products/new" className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
                <Plus className="h-4 w-4" /> 제품 추가
              </Link>
            </div>
          )}
          {rows.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {rows.map((p) => {
                const st = STATUS[(p.status ?? "draft") as StatusKey] ?? STATUS.draft;
                const checked = sel.has(p.id);
                return (
                  <div key={p.id} className={"relative rounded-2xl border bg-white p-5 transition-colors " + (checked ? "border-primary ring-1 ring-primary/30" : "border-slate-200 hover:border-primary")}>
                    {/* 체크박스 (삭제 선택) */}
                    <button type="button" aria-label="선택" onClick={() => toggle(p.id)}
                      className={"absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded border " + (checked ? "border-primary bg-primary text-white" : "border-slate-300 bg-white")}>
                      {checked && <CheckCircle2 className="h-4 w-4" />}
                    </button>
                    <Link href={`/app/products/${p.id}`} className="block">
                      <div className="pr-7">
                        <h3 className="truncate text-base font-bold text-ink">{p.name}</h3>
                        <p className="mt-0.5 truncate text-xs text-slate-400">
                          {p.sku ?? "—"} <span className="mx-1 text-slate-200">|</span> {p.category ?? "미분류"}
                        </p>
                      </div>
                      <span className={"mt-2 inline-block rounded-md px-2 py-0.5 text-[11px] font-bold " + st.cls}>{st.label}</span>
                      <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1"><Package className="h-3.5 w-3.5" /> 부품 <b className="text-slate-700">0</b></span>
                        <span className="inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> 문서 <b className="text-slate-700">0</b></span>
                        <span className="inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> 누락항목 <b className="text-slate-700">0</b></span>
                      </div>
                      <p className="mt-3 text-[11px] text-slate-400">{new Date(p.created_at).toLocaleDateString("ko-KR")} 수정</p>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 선택 삭제 액션 바 */}
      {sel.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-xl">
          <button onClick={() => setSel(new Set())} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
            <X className="h-4 w-4" /> 선택 해제
          </button>
          <span className="text-sm font-semibold text-ink">{sel.size}개 선택됨</span>
          <button
            onClick={() => {
              if (confirm(`선택한 ${sel.size}개 제품을 삭제하시겠습니까?`)) del.mutate([...sel]);
            }}
            disabled={del.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" /> {del.isPending ? "삭제 중…" : "삭제하기"}
          </button>
        </div>
      )}
    </>
  );
}
