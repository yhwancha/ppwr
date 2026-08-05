"use client";

import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  FileText,
  Gauge,
  LayoutGrid,
  LogIn,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useSession } from "@/src/features/auth/session";

const steps = [
  {
    n: "01",
    title: "제품·포장 정보 입력",
    desc: "제품과 포장 구조(재질·구성·중량 등)를 입력합니다. 복잡한 규정 지식은 필요 없습니다.",
  },
  {
    n: "02",
    title: "AI 규제 적합성 진단",
    desc: "EU 2025/40 PPWR 기준으로 미이행 리스크와 누락 항목을 즉시 분석합니다.",
  },
  {
    n: "03",
    title: "리포트 · RFI 자동 생성",
    desc: "결과 리포트와 공급사 제출용 정보요청서(RFI)를 자동으로 매핑해 드립니다.",
  },
];

const features = [
  {
    icon: Gauge,
    title: "즉시 리스크 진단",
    desc: "제품 단위로 PPWR 적합성 리스크를 점수화해 어디부터 대응할지 명확히 합니다.",
  },
  {
    icon: ClipboardCheck,
    title: "RFI 자동 매핑",
    desc: "공급사에 요청해야 할 자료를 항목별로 정리해 수집 부담을 크게 줄입니다.",
  },
  {
    icon: RefreshCw,
    title: "최신 규정 반영",
    desc: "EU 포장폐기물 규정(2025/40) 업데이트를 자동 반영해 항상 최신 기준으로 진단합니다.",
  },
  {
    icon: FileText,
    title: "리포트 · 히스토리",
    desc: "진단 결과를 문서로 보관하고 제출용 자료로 바로 활용할 수 있습니다.",
  },
];

export default function HomePage() {
  const { user, loading } = useSession();

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(64,96,96,0.5),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_90%,rgba(64,96,96,0.25),transparent_45%)]" />
        <div className="relative mx-auto flex min-h-[78vh] w-full max-w-5xl flex-col items-center justify-center px-6 py-28 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold text-primary-light">
            <Sparkles className="h-3.5 w-3.5" /> EU 2025/40 PPWR 대응 솔루션
          </span>
          <h1 className="mt-7 text-4xl font-extrabold leading-[1.15] tracking-tight md:text-6xl">
            EU 포장폐기물 규정,
            <br />
            <span className="text-primary-light">AI로 미리 진단</span>하고 대응하세요
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            제품과 포장 구조만 입력하면 규제 미이행 리스크를 즉시 진단하고,
            공급사 제출용 정보요청서(RFI)까지 자동으로 매핑해 드립니다.
          </p>

          <div className="mt-9 flex min-h-[52px] flex-wrap items-center justify-center gap-3">
            {loading ? null : user ? (
              <Link
                href="/app"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-primary-dark"
              >
                <LayoutGrid className="h-4 w-4" /> 대시보드로 이동
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-primary-dark"
                >
                  무료로 시작하기 <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  요금제 보기
                </Link>
              </>
            )}
          </div>

          <p className="mt-10 flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-primary-light" />
            친환경 패키지 전문 리스튜디오(REVATION)가 만든 규제 대응 솔루션
          </p>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-24">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              How it works
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-ink md:text-4xl">
              3단계로 끝나는 규제 대응
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-500">
              규정 해석부터 자료 수집까지, 복잡한 과정을 자동화했습니다.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.n}
                className="relative rounded-2xl border border-slate-200 bg-slate-50 p-8"
              >
                <span className="text-4xl font-black text-primary/25">{s.n}</span>
                <h3 className="mt-3 text-lg font-bold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-slate-50">
        <div className="mx-auto w-full max-w-6xl px-6 py-24">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Features
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-ink md:text-4xl">
              규제 대응에 필요한 모든 것
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-2xl border border-slate-200 bg-white p-7 transition-shadow hover:shadow-md"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-bold text-ink">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-ink">
        <div className="mx-auto w-full max-w-4xl px-6 py-24 text-center text-white">
          <h2 className="text-3xl font-extrabold leading-tight md:text-4xl">
            지금 제품 하나를 진단해 보세요
          </h2>
          <p className="mt-4 text-slate-300">
            단건 셀프진단권으로 부담 없이 시작하거나, 정기구독으로 전 제품군을 관리하세요.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={user ? "/app" : "/auth/signup"}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-primary-dark"
            >
              {user ? "대시보드로 이동" : "무료로 시작하기"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              요금제 보기
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
