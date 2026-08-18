"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Layers, Plus, Trash2, X } from "lucide-react";
import { getPpwrComponentService } from "@/src/shared/api";

const MATERIAL_TYPES = ["PP", "PET", "PE", "PVC", "유리", "알루미늄", "종이", "복합재", "기타"];
const LAYER_TYPES = ["본체", "코팅", "잉크", "접착제", "라이너", "기타"];

export default function MaterialEditor({
  componentId,
  readOnly,
}: {
  componentId: number;
  readOnly?: boolean;
}) {
  const qc = useQueryClient();
  const svc = getPpwrComponentService();
  const key = ["ppwr", "materials", componentId];

  const { data: materials = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: () => svc.listMaterials(componentId),
  });

  const [adding, setAdding] = useState(false);
  const [m, setM] = useState({ material_type: "", material_name: "", layer_type: "", recycled_content: "", coating: "", colorant: "" });
  const [err, setErr] = useState<string | null>(null);

  const add = useMutation({
    mutationFn: () =>
      svc.addMaterial(componentId, {
        material_type: m.material_type || null,
        material_name: m.material_name.trim() || null,
        layer_type: m.layer_type || null,
        recycled_content: m.recycled_content.trim() === "" ? null : Number(m.recycled_content),
        coating: m.coating.trim() || null,
        colorant: m.colorant.trim() || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key });
      setAdding(false);
      setM({ material_type: "", material_name: "", layer_type: "", recycled_content: "", coating: "", colorant: "" });
      setErr(null);
    },
    onError: (e) => setErr(e instanceof Error ? e.message : "소재 추가에 실패했습니다."),
  });

  const remove = useMutation({
    mutationFn: (id: number) => svc.removeMaterial(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return (
    <section className="mt-4 grid gap-6 rounded-2xl border border-slate-200 bg-white p-8 md:grid-cols-[300px_1fr]">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
          <Layers className="h-4 w-4 text-primary" /> 소재 / 레이어
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          부품을 구성하는 소재와 레이어(본체·코팅·잉크·접착제)입니다. 다층 구조는 레이어별로 등록하세요.
        </p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-slate-400">불러오는 중…</p>
        ) : materials.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
            등록된 소재가 없습니다.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-semibold text-slate-400">
                  <th className="py-2 pr-3">소재</th>
                  <th className="py-2 pr-3">레이어</th>
                  <th className="py-2 pr-3">소재명</th>
                  <th className="py-2 pr-3 text-right">재생(%)</th>
                  <th className="py-2 pr-3">코팅</th>
                  <th className="py-2 pr-3">착색</th>
                  {!readOnly && <th className="py-2" />}
                </tr>
              </thead>
              <tbody>
                {materials.map((mt) => (
                  <tr key={mt.id} className="border-b border-slate-100 text-slate-700">
                    <td className="py-2.5 pr-3 font-semibold text-ink">{mt.material_type ?? "—"}</td>
                    <td className="py-2.5 pr-3 text-slate-500">{mt.layer_type ?? "—"}</td>
                    <td className="py-2.5 pr-3">{mt.material_name ?? "—"}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{mt.recycled_content ?? "—"}</td>
                    <td className="py-2.5 pr-3 text-slate-500">{mt.coating ?? "—"}</td>
                    <td className="py-2.5 pr-3 text-slate-500">{mt.colorant ?? "—"}</td>
                    {!readOnly && (
                      <td className="py-2.5 text-right">
                        <button type="button" onClick={() => remove.mutate(mt.id)} className="text-slate-300 hover:text-danger" aria-label="소재 삭제">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {err && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-danger">{err}</p>
        )}

        {readOnly ? null : adding ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-600">소재 추가</p>
              <button type="button" onClick={() => setAdding(false)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Sel label="소재" value={m.material_type} onChange={(v) => setM({ ...m, material_type: v })} options={MATERIAL_TYPES} />
              <Sel label="레이어" value={m.layer_type} onChange={(v) => setM({ ...m, layer_type: v })} options={LAYER_TYPES} />
              <Inp label="소재명" value={m.material_name} onChange={(v) => setM({ ...m, material_name: v })} placeholder="선택" />
              <Inp label="재생원료(%)" type="number" value={m.recycled_content} onChange={(v) => setM({ ...m, recycled_content: v })} placeholder="0" />
              <Inp label="코팅" value={m.coating} onChange={(v) => setM({ ...m, coating: v })} placeholder="선택" />
              <Inp label="착색제" value={m.colorant} onChange={(v) => setM({ ...m, colorant: v })} placeholder="선택" />
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => add.mutate()} disabled={add.isPending} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
                {add.isPending ? "추가 중…" : "소재 추가"}
              </button>
              <button type="button" onClick={() => setAdding(false)} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white">취소</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Plus className="h-4 w-4" /> 소재 추가
          </button>
        )}
      </div>
    </section>
  );
}

const ip = "w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none placeholder:text-slate-300 focus:border-primary";
function L({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-sm font-semibold text-slate-700">{children}</label>;
}
function Inp({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return <div><L>{label}</L><input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={ip} /></div>;
}
function Sel({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div><L>{label}</L>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={ip + " bg-white"}>
        <option value="">선택</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select></div>
  );
}
