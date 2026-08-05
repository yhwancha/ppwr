"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  FileText,
  Gauge,
  LayoutGrid,
  LogIn,
  Recycle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useSession } from "@/src/features/auth/session";

const steps = [
  {
    n: "01",
    title: "제품·포장재 등록",
    desc: "제품과 포장 구성품(용기·캡·라벨·완충재·박스 등)을 SKU 단위로 등록합니다.",
  },
  {
    n: "02",
    title: "AI 사전진단 · 자료 보완",
    desc: "PPWR 대응 수준과 보완 필요 항목을 확인하고, 공급사에 요청할 자료를 정리합니다.",
  },
  {
    n: "03",
    title: "TD · DoC · EPR 발행",
    desc: "기술문서(TD)·적합성 선언서(DoC)·EPR 기초자료를 연결된 데이터로 생성합니다.",
  },
];

const features = [
  {
    icon: Gauge,
    title: "AI 기반 PPWR 사전진단",
    desc: "보유한 정보만으로 대응 수준을 점검하고, 누락 정보·공급사 요청자료·시험 필요 항목을 구분해 안내합니다.",
  },
  {
    icon: FileText,
    title: "기술문서(TD) 작성 지원",
    desc: "진단과 증빙자료를 근거로 포장재 PPWR 대응 기술문서를 작성하고, 데이터 변경 시 업데이트로 관리합니다.",
  },
  {
    icon: BadgeCheck,
    title: "EU 적합성 선언서(DoC)",
    desc: "TD와 증빙을 기반으로 DoC 발행을 지원하고 문서 버전·발행 이력을 체계적으로 관리합니다.",
  },
  {
    icon: Recycle,
    title: "EPR 기초자료 제공",
    desc: "소재·중량 정보를 표준화해 국가별 EPR 등록·보고 준비용 기초 데이터로 연결합니다.",
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
            포장재 정보를 한 번 입력하면 AI 사전진단부터 기술문서(TD)·적합성 선언서(DoC)·
            EPR 기초자료까지 하나의 과정으로 연결됩니다.
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
              Core Services
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-ink md:text-4xl">
              핵심 서비스
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-500">
              한 번 등록한 제품·포장재 데이터를 진단부터 문서 발행까지 연결해 활용합니다.
            </p>
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

          <div className="mt-10 text-center">
            <Link
              href="/service"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-primary hover:text-primary"
            >
              서비스 자세히 보기 <ArrowRight className="h-4 w-4" />
            </Link>
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
