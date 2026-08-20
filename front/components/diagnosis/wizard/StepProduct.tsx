"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Clock,
  FileText,
  Layers,
  Package,
  PencilLine,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { getPpwrComponentService, getPpwrProductService } from "@/src/shared/api";
import { RequiredBanner, StepCard } from "./parts";

const LEVELS = [1, 2, 3] as const;

function fmtDate(v: string | null | undefined) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}

/** 라벨 + 값 한 쌍 (읽기 전용 요약 그리드) */
function Spec({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      <p className="mt-1 text-sm text-slate-500">{value || "-"}</p>
    </div>
  );
}

function SpecSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-slate-100 py-5 first:border-t-0 first:pt-0">
      {title && <h4 className="mb-3 text-sm font-bold text-ink">{title}</h4>}
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export default function StepProduct({
  productId,
  onSelectProduct,
}: {
  productId: number | null;
  onSelectProduct: (id: number) => void;
}) {
  const [picking, setPicking] = useState(productId == null);
  const [level, setLevel] = useState<(typeof LEVELS)[number]>(1);
  const [q, setQ] = useState("");

  const { data: products = [] } = useQuery({
    queryKey: ["ppwr", "products"],
    queryFn: () => getPpwrProductService().list(),
  });

  const { data: instances = [] } = useQuery({
    queryKey: ["ppwr", "instances", productId],
    queryFn: () => getPpwrComponentService().listInstances(productId as number),
    enabled: productId != null,
  });

  const product = products.find((p) => p.id === productId) ?? null;
  const atLevel = instances.filter((i) => (i.packaging_level ?? 1) === level);
  const filtered = q.trim()
    ? products.filter((p) =>
        `${p.name} ${p.sku ?? ""}`.toLowerCase().includes(q.trim().toLowerCase()),
      )
    : products;

  // 시안의 '필수 입력 내용 N건' — 미제출 문서/미입력 중량 기준
  const missingComponentInfo = instances.filter((i) => i.weight_per_unit == null).length;

  return (
    <StepCard
      step={2}
      title="제품 정보 입력"
      description="기존에 만들어진 제품과 부품의 정보를 검토합니다."
    >
      {/* 진단할 제품 선택 */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink">진단할 제품 선택</h3>
        <button
          type="button"
          onClick={() => setPicking((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Search className="h-3.5 w-3.5" /> 제품 선택
        </button>
      </div>

      {picking && (
        <div className="mt-3 rounded-xl border border-slate-200 p-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="제품명, SKU 검색"
              className="w-full text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          <ul className="mt-2 max-h-56 overflow-y-auto">
            {filtered.length === 0 && (
              <li className="py-6 text-center text-sm text-slate-400">
                등록된 제품이 없습니다.{" "}
                <Link href="/app/products/new" className="font-semibold text-primary underline">
                  제품 추가
                </Link>
              </li>
            )}
            {filtered.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelectProduct(p.id);
                    setPicking(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-slate-50"
                >
                  <Package className="h-4 w-4 text-slate-300" />
                  <span className="text-sm font-semibold text-ink">{p.name}</span>
                  <span className="text-xs text-slate-400">{p.sku ?? "SKU 미지정"}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {product && (
        <div className="mt-3 rounded-xl border border-slate-200 p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
              <Package className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-ink">{product.name}</p>
              <p className="mt-1 text-xs text-slate-400">
                {product.sku ?? "SKU 미지정"} <span className="mx-1 text-slate-200">|</span>{" "}
                {product.category ?? "미분류"}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-slate-300" /> 부품{" "}
              <b className="text-ink">{instances.length}개</b>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-300" /> 문서 <b className="text-ink">0개</b>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-300" /> {fmtDate(product.updated_at)} 수정
            </span>
          </div>
        </div>
      )}

      {/* 부품 구성 */}
      {product && (
        <div className="mt-7 rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink">부품 구성</h3>
            <Link
              href={`/app/products/${product.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3.5 py-2 text-xs font-semibold text-white hover:bg-ink-soft"
            >
              <Plus className="h-3.5 w-3.5" /> 부품 추가
            </Link>
          </div>

          <div className="mt-4">
            <RequiredBanner count={missingComponentInfo} />
          </div>

          <div className="flex overflow-hidden rounded-lg border border-slate-200">
            {LEVELS.map((l) => {
              const count = instances.filter((i) => (i.packaging_level ?? 1) === l).length;
              const active = l === level;
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  className={
                    "flex-1 border-r border-slate-200 py-2.5 text-xs font-semibold last:border-r-0 " +
                    (active ? "bg-slate-100 text-ink" : "bg-white text-slate-400 hover:bg-slate-50")
                  }
                >
                  {l}차 포장재 ({count})
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {level === 1
              ? "제품과 직접 접촉하는 포장재입니다."
              : `${level}차 포장재입니다.`}
          </p>

          <ul className="mt-3 space-y-2">
            {atLevel.length === 0 && (
              <li className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-xs text-slate-400">
                {level}차 포장재가 없습니다.
              </li>
            )}
            {atLevel.map((i) => (
              <li key={i.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center gap-3">
                  <span className="h-9 w-9 shrink-0 rounded bg-slate-100" />
                  <span className="flex-1 truncate text-sm font-semibold text-ink">
                    {i.master?.name ?? "이름 없는 부품"}
                  </span>
                  <span className="text-xs text-slate-400">{i.role ?? "-"}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-2 text-xs text-slate-500">
                  <span>{i.weight_per_unit != null ? `${i.weight_per_unit}g` : "중량 미입력"}</span>
                  {i.removable != null && (
                    <span className="rounded bg-sky-50 px-2 py-0.5 font-semibold text-sky-600">
                      {i.removable ? "분리 가능" : "분리 불가"}
                    </span>
                  )}
                  <Link
                    href={`/app/components/${i.component_id}`}
                    className="ml-auto inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    자세히 보기 <ArrowUpRight className="h-3 w-3" />
                  </Link>
                  <span className="text-slate-300">
                    <Trash2 className="h-3.5 w-3.5" />
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 기본 제품 정보 (읽기 전용) */}
      {product && (
        <div className="mt-7 rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink">기본 제품 정보</h3>
            <Link
              href={`/app/products/${product.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <PencilLine className="h-3.5 w-3.5" /> 제품 정보 수정
            </Link>
          </div>

          <div className="mt-4">
            <SpecSection>
              <Spec label="제품명 (영문)" value={product.name} />
              <Spec label="제품명 (국문)" value={product.name_ko} />
              <Spec label="SKU" value={product.sku} />
              <Spec label="모델명" value={product.model_name} />
              <Spec label="제품 카테고리" value={product.category} />
              <Spec label="식별번호" value={product.identifier_no} />
            </SpecSection>

            <SpecSection title="제조 및 규제 코드">
              <Spec label="제조 국가" value={product.manufacturing_country} />
              <Spec label="HS Code" value={product.hs_code} />
            </SpecSection>

            <SpecSection title="제품 물성 정보">
              <Spec label="내용물 형태" value={product.content_form} />
              <Spec label="보관 조건" value={product.storage_condition} />
              <Spec
                label="제품 Net 중량"
                value={product.net_weight && `${product.net_weight} ${product.net_weight_unit ?? "g"}`}
              />
              <Spec
                label="제품 Net 치수"
                value={
                  product.net_width &&
                  `W ${product.net_width} × H ${product.net_height} × D ${product.net_depth} ${product.net_dim_unit ?? "mm"}`
                }
              />
            </SpecSection>

            <SpecSection title="최종 포장 정보">
              <Spec
                label="최종 포장 Gross 중량"
                value={
                  product.gross_weight && `${product.gross_weight} ${product.gross_weight_unit ?? "g"}`
                }
              />
              <Spec
                label="최종 포장 Gross 치수"
                value={
                  product.gross_width &&
                  `W ${product.gross_width} × H ${product.gross_height} × D ${product.gross_depth} ${product.gross_dim_unit ?? "mm"}`
                }
              />
            </SpecSection>

            <SpecSection title="EU 시장 출시 계획">
              <Spec label="EU 시장 출시 형태" value={product.eu_market_status} />
              <Spec label="EU 출시 예정일" value={fmtDate(product.eu_launch_date)} />
              <Spec label="EU 판매 예정국가" value={product.eu_launch_countries} />
              <Spec
                label="EU 연간 예상 물량"
                value={product.eu_annual_volume && `${product.eu_annual_volume} units`}
              />
            </SpecSection>

            <SpecSection title="기타">
              <Spec label="Contact-sensitive 여부" value={product.contact_sensitive ? "예" : "아니오"} />
              <Spec label="판매 채널" value={product.sales_channel} />
            </SpecSection>

            <SpecSection title="등록 정보">
              <Spec label="최종 수정일" value={fmtDate(product.updated_at)} />
              <Spec label="등록일" value={fmtDate(product.created_at)} />
            </SpecSection>
          </div>
        </div>
      )}

      {!product && !picking && (
        <p className="mt-6 rounded-xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-400">
          진단할 제품을 선택해 주세요.
        </p>
      )}
    </StepCard>
  );
}
