import Link from "next/link";
import { ArrowRight, Package, Plus } from "lucide-react";
import Topbar from "@/components/app/Topbar";

export default function AppDashboardPage() {
  return (
    <>
      <Topbar crumbs={[{ label: "대시보드" }]} />
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-ink">진단 워크스페이스</h1>
        <p className="mt-1 text-sm text-slate-500">
          제품을 등록하고 포장 구조·증빙을 관리한 뒤 PPWR 준비도를 진단합니다.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <Link
            href="/app/products/new"
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 hover:border-primary"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
                <Plus className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-ink">새 제품 등록</p>
                <p className="text-sm text-slate-500">제품 기본 정보 입력</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400" />
          </Link>

          <Link
            href="/app/products"
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 hover:border-primary"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Package className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-ink">제품 관리</p>
                <p className="text-sm text-slate-500">내 제품 목록</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400" />
          </Link>
        </div>
      </div>
    </>
  );
}
