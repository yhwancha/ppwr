"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import Topbar from "@/components/app/Topbar";
import { signOut } from "@/src/features/auth/session";
import {
  DATA_ACCESS_EVENT,
  readAdminDataAccess,
  writeAdminDataAccess,
} from "@/src/features/settings/data-access";

/** Figma 시안: 설정 > 보안 설정 — 데이터 접근 설정 카드 + 우상단 로그아웃 */
export default function SecuritySettingsPage() {
  const router = useRouter();
  const [dataAccess, setDataAccess] = useState(false);

  useEffect(() => {
    const refresh = () => setDataAccess(readAdminDataAccess());
    refresh();
    window.addEventListener(DATA_ACCESS_EVENT, refresh);
    return () => window.removeEventListener(DATA_ACCESS_EVENT, refresh);
  }, []);

  function toggleDataAccess() {
    const next = !dataAccess;
    setDataAccess(next);
    writeAdminDataAccess(next);
  }

  async function handleLogout() {
    await signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <>
      <Topbar crumbs={[{ label: "보안 설정" }]} />
      <div className="px-8 pb-24">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold text-ink">보안 설정</h1>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            로그아웃
          </button>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-6">
          <h2 className="text-base font-bold text-ink">데이터 접근 설정</h2>
          <hr className="mt-4 border-slate-100" />

          <div className="mt-5">
            <p className="text-sm font-semibold text-ink">
              관리자 데이터 접근 권한
            </p>
            <button
              type="button"
              role="switch"
              aria-checked={dataAccess}
              aria-label="관리자 데이터 접근 권한"
              onClick={toggleDataAccess}
              className={
                "mt-3 flex h-8 w-14 items-center rounded-full p-1 transition-colors " +
                (dataAccess ? "bg-primary" : "bg-slate-200")
              }
            >
              <span
                className={
                  "flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm transition-transform " +
                  (dataAccess ? "translate-x-6 text-primary" : "translate-x-0")
                }
              >
                {dataAccess ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <X className="h-3.5 w-3.5" />
                )}
              </span>
            </button>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              해당 스위치를 켜면 리스튜디오 관리자가 직접 우리 회사의 데이터에
              접근해 제품 등록, 부품 등록 등의 대행 서비스를 제공할 수 있습니다.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
