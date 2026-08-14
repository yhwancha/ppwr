"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Boxes, Plus, Trash2, X } from "lucide-react";
import { getPpwrComponentService } from "@/src/shared/api";
import type { ComponentMasterRow } from "@/src/lib/ppwr-component-service";

const LEVEL_LABEL: Record<number, string> = { 1: "1차", 2: "2차", 3: "3차" };
const COMPONENT_TYPES = ["뚜껑/캡", "용기/병", "라벨", "파우치", "단상자", "완충재", "박스", "기타"];
const MATERIAL_TYPES = ["PP", "PET", "PE", "PVC", "유리", "알루미늄", "종이", "복합재", "기타"];

type UsageState = {
  packaging_level: string;
  quantity: string;
  weight_per_unit: string;
  role: string;
  removable: boolean;
};
const emptyUsage: UsageState = {
  packaging_level: "1",
  quantity: "1",
  weight_per_unit: "",
  role: "",
  removable: true,
};

export default function ComponentManager({ productId }: { productId: number }) {
  const qc = useQueryClient();
  const svc = getPpwrComponentService();
  const key = ["ppwr", "components", productId];

  const { data: instances = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: () => svc.listInstances(productId),
  });
  const { data: library = [] } = useQuery({
    queryKey: ["ppwr", "component-library"],
    queryFn: () => svc.listLibrary(),
  });

  const [adding, setAdding] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const remove = useMutation({
    mutationFn: (id: number) => svc.removeInstance(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: key });
    qc.invalidateQueries({ queryKey: ["ppwr", "component-library"] });
  };

  return (
    <section className="mt-4 grid gap-6 rounded-2xl border border-slate-200 bg-white p-8 md:grid-cols-[300px_1fr]">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
          <Boxes className="h-4 w-4 text-primary" /> 부품 구성
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          이 제품에 사용된 포장 부품입니다. 기존 부품을 불러오거나 새로 등록할 수 있고, 등록한 부품은 다른 제품에서 재사용됩니다.
        </p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-slate-400">불러오는 중…</p>
        ) : instances.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
            아직 등록된 부품이 없습니다. 아래에서 부품을 추가하세요.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-semibold text-slate-400">
                  <th className="py-2 pr-3">단계</th>
                  <th className="py-2 pr-3">부품명</th>
                  <th className="py-2 pr-3">유형</th>
                  <th className="py-2 pr-3 text-right">수량</th>
                  <th className="py-2 pr-3 text-right">개당(g)</th>
                  <th className="py-2 pr-3 text-right">총중량(g)</th>
                  <th className="py-2 pr-3">역할</th>
                  <th className="py-2 pr-3">분리</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {instances.map((it) => (
                  <tr key={it.id} className="border-b border-slate-100 text-slate-700">
                    <td className="py-2.5 pr-3">
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        {it.packaging_level ? LEVEL_LABEL[it.packaging_level] ?? "—" : "—"}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 font-semibold text-ink">{it.master?.name ?? "—"}</td>
                    <td className="py-2.5 pr-3 text-slate-500">{it.master?.type ?? "—"}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{it.quantity}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{it.weight_per_unit ?? "—"}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{it.total_weight ?? "—"}</td>
                    <td className="py-2.5 pr-3 text-slate-500">{it.role ?? "—"}</td>
                    <td className="py-2.5 pr-3">{it.removable ? "가능" : "불가"}</td>
                    <td className="py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`"${it.master?.name ?? "부품"}"을 이 제품에서 제거할까요?`))
                            remove.mutate(it.id);
                        }}
                        className="text-slate-300 hover:text-danger"
                        aria-label="부품 제거"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {err && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-danger">
            {err}
          </p>
        )}

        {adding ? (
          <AddPanel
            library={library}
            onCancel={() => {
              setAdding(false);
              setErr(null);
            }}
            onDone={() => {
              setAdding(false);
              setErr(null);
              invalidateAll();
            }}
            onError={setErr}
            productId={productId}
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" /> 부품 추가
          </button>
        )}
      </div>
    </section>
  );
}

/* ---------- 부품 추가 패널 ---------- */
function AddPanel({
  productId,
  library,
  onCancel,
  onDone,
  onError,
}: {
  productId: number;
  library: ComponentMasterRow[];
  onCancel: () => void;
  onDone: () => void;
  onError: (m: string) => void;
}) {
  const svc = getPpwrComponentService();
  const [mode, setMode] = useState<"existing" | "new">(library.length > 0 ? "existing" : "new");

  // 기존 불러오기
  const [masterId, setMasterId] = useState<string>("");
  // 신규 생성
  const [nm, setNm] = useState({ name: "", type: "", recycled_content: "", material_type: "", material_name: "" });
  // 사용정보 (공통)
  const [u, setU] = useState<UsageState>(emptyUsage);

  const [pending, setPending] = useState(false);
  const numOrNull = (v: string) => (v.trim() === "" ? null : Number(v));

  async function submit() {
    onError("");
    const usage = {
      packaging_level: u.packaging_level ? Number(u.packaging_level) : null,
      quantity: u.quantity.trim() === "" ? 1 : Number(u.quantity),
      weight_per_unit: numOrNull(u.weight_per_unit),
      role: u.role.trim() || null,
      removable: u.removable,
    };
    try {
      setPending(true);
      if (mode === "existing") {
        if (!masterId) return onError("불러올 부품을 선택하세요.");
        await svc.addInstance(productId, Number(masterId), usage);
      } else {
        if (!nm.name.trim()) return onError("부품명은 필수입니다.");
        const master = await svc.createMaster({
          name: nm.name.trim(),
          type: nm.type || null,
          recycled_content: numOrNull(nm.recycled_content),
        });
        if (nm.material_type || nm.material_name.trim()) {
          await svc.addMaterial(master.id, {
            material_type: nm.material_type || null,
            material_name: nm.material_name.trim() || null,
          });
        }
        await svc.addInstance(productId, master.id, usage);
      }
      onDone();
    } catch (e) {
      onError(e instanceof Error ? e.message : "부품 추가에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setMode("existing")}
            className={"rounded-md px-3 py-1.5 " + (mode === "existing" ? "bg-primary text-white" : "text-slate-500")}
          >
            기존 부품 불러오기
          </button>
          <button
            type="button"
            onClick={() => setMode("new")}
            className={"rounded-md px-3 py-1.5 " + (mode === "new" ? "bg-primary text-white" : "text-slate-500")}
          >
            신규 부품 등록
          </button>
        </div>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      {mode === "existing" ? (
        <div>
          <Lbl>부품 선택 (내 라이브러리 · 리베이션 공용)</Lbl>
          <select value={masterId} onChange={(e) => setMasterId(e.target.value)} className={ip + " bg-white"}>
            <option value="">부품을 선택하세요</option>
            {library.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
                {m.type ? ` (${m.type})` : ""}
                {m.owner_user_id == null ? " · 공용" : ""}
              </option>
            ))}
          </select>
          {library.length === 0 && (
            <p className="mt-2 text-xs text-slate-400">불러올 부품이 없습니다. 신규 부품 등록을 이용하세요.</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Lbl required>부품명</Lbl>
            <input value={nm.name} onChange={(e) => setNm({ ...nm, name: e.target.value })} placeholder="예: PP 스크류 캡" className={ip} />
          </div>
          <div>
            <Lbl>유형</Lbl>
            <select value={nm.type} onChange={(e) => setNm({ ...nm, type: e.target.value })} className={ip + " bg-white"}>
              <option value="">선택</option>
              {COMPONENT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <Lbl>재생원료 함량 (%)</Lbl>
            <input type="number" value={nm.recycled_content} onChange={(e) => setNm({ ...nm, recycled_content: e.target.value })} placeholder="0" className={ip} />
          </div>
          <div>
            <Lbl>주 소재</Lbl>
            <div className="flex gap-2">
              <select value={nm.material_type} onChange={(e) => setNm({ ...nm, material_type: e.target.value })} className={ip + " bg-white"}>
                <option value="">소재 선택</option>
                {MATERIAL_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              <input value={nm.material_name} onChange={(e) => setNm({ ...nm, material_name: e.target.value })} placeholder="소재명(선택)" className={ip} />
            </div>
          </div>
        </div>
      )}

      {/* 사용정보 */}
      <div className="mt-5 border-t border-slate-200 pt-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">이 제품에서의 사용 정보</p>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <div>
            <Lbl>포장 단계</Lbl>
            <select value={u.packaging_level} onChange={(e) => setU({ ...u, packaging_level: e.target.value })} className={ip + " bg-white"}>
              <option value="1">1차</option>
              <option value="2">2차</option>
              <option value="3">3차</option>
            </select>
          </div>
          <div>
            <Lbl>수량</Lbl>
            <input type="number" value={u.quantity} onChange={(e) => setU({ ...u, quantity: e.target.value })} className={ip} />
          </div>
          <div>
            <Lbl>개당 중량(g)</Lbl>
            <input type="number" value={u.weight_per_unit} onChange={(e) => setU({ ...u, weight_per_unit: e.target.value })} placeholder="0.00" className={ip} />
          </div>
          <div>
            <Lbl>역할</Lbl>
            <input value={u.role} onChange={(e) => setU({ ...u, role: e.target.value })} placeholder="예: 밀폐" className={ip} />
          </div>
          <div>
            <Lbl>분리 가능</Lbl>
            <button
              type="button"
              onClick={() => setU({ ...u, removable: !u.removable })}
              className={
                "h-[46px] w-full rounded-lg border text-sm font-semibold " +
                (u.removable ? "border-primary bg-primary/5 text-primary" : "border-slate-300 text-slate-500")
              }
            >
              {u.removable ? "분리 가능" : "분리 불가"}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {pending ? "추가 중…" : "부품 추가"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white">
          취소
        </button>
      </div>
    </div>
  );
}

const ip =
  "w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none placeholder:text-slate-300 focus:border-primary";
function Lbl({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-700">
      {children} {required && <span className="text-danger">*</span>}
    </label>
  );
}
