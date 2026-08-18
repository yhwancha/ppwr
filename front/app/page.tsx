"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Check,
  ChevronRight,
  FileText,
  Gauge,
  MessageSquareText,
  PackageCheck,
  Recycle,
  Send,
} from "lucide-react";
import { useSession } from "@/src/features/auth/session";
import {
  SUBSCRIPTION_TIERS,
  SUBSCRIPTION_ENABLED,
  SERVICE_ITEMS,
  formatKRW,
} from "@/src/shared/payments/config";
import { BASE_PATH } from "@/src/shared/base-path";

const steps = [
  {
    title: "포장 데이터 정리",
    desc: "제품, 부품, 재질, 중량, 공급사 문서를 한 화면에서 연결합니다.",
    detail: "용기, 캡, 라벨, 완충재처럼 흩어진 포장 요소를 SKU 기준으로 묶고 누락된 항목을 바로 표시합니다.",
    shape: "rounded-[42%_58%_48%_52%/50%_44%_56%_50%]",
  },
  {
    title: "AI 규정 진단",
    desc: "PPWR 조항별 리스크와 보완 자료를 먼저 확인합니다.",
    detail: "입력된 포장 정보를 기준으로 재활용성, 제한 물질, 문서 확보 상태를 분리해 검토합니다.",
    shape: "rounded-[58%_42%_54%_46%/42%_55%_45%_58%]",
  },
  {
    title: "제출 문서 준비",
    desc: "TD, DoC, EPR 기초자료를 같은 데이터에서 이어서 만듭니다.",
    detail: "검토 결과와 증빙 파일을 기반으로 고객사 제출용 문서 패키지를 빠르게 구성합니다.",
    shape: "rounded-[50%_50%_40%_60%/58%_42%_58%_42%]",
  },
];

const services = [
  {
    icon: Gauge,
    title: "AI 사전진단",
    desc: "보유 정보만으로 대응 수준과 보완 항목을 먼저 확인합니다.",
  },
  {
    icon: FileText,
    title: "기술문서 관리",
    desc: "제품별 근거 자료와 변경 이력을 한 곳에서 관리합니다.",
  },
  {
    icon: BadgeCheck,
    title: "DoC 발행 지원",
    desc: "필수 증빙과 선언서 작성 흐름을 데이터와 연결합니다.",
  },
  {
    icon: Recycle,
    title: "EPR 기초자료",
    desc: "재질, 중량, 공급사 정보를 보고 준비용 데이터로 정리합니다.",
  },
];

const revationClientLogos = Array.from(
  { length: 60 },
  (_, index) => `${BASE_PATH}/revation-clients/client-${String(index + 1).padStart(2, "0")}.svg`,
);

const cases = [
  {
    title: "화장품 수출사의 부품 자료 정리",
    date: "2026.08.12",
    desc: "용기와 라벨 증빙을 제품별로 다시 묶어 고객사 요청 대응 시간을 줄였습니다.",
    image: "https://www.7center.com/upload/elfinder/GLOBAL%20BRANDING%20%26%20EXPORT%20PACKAGING%201.jpg",
    imagePosition: "object-[18%_24%]",
  },
  {
    title: "식품 브랜드의 포장 구조 점검",
    date: "2026.08.06",
    desc: "병, 캡, 박스 구성을 나눠 재활용성 검토와 공급사 요청 목록을 만들었습니다.",
    image: "https://www.paketwaage.com/fileadmin/_processed_/0/1/csm_p15-h3-fristentabelle-9200_a81fdc5a8c.webp",
    imagePosition: "object-[52%_16%]",
  },
  {
    title: "제조사의 문서 제출 흐름 통합",
    date: "2026.07.29",
    desc: "TD와 DoC 준비 상태를 팀이 같은 기준으로 확인하도록 정리했습니다.",
    image: "https://images.squarespace-cdn.com/content/v1/698c8f8fba0a43623af3069e/514e7525-6293-4a04-aa66-7458c7d3598e/e3ddcdde-90ef-43fd-a76c-b040236f05d2.png",
    imagePosition: "object-[84%_22%]",
  },
];

const posts = [
  {
    title: "PPWR Article 5에서 먼저 봐야 할 포장재 정보",
    date: "2026.08.14",
    desc: "제한 물질 검토 전에 제품과 포장재 데이터에서 확인할 항목을 정리했습니다.",
    image: "https://cdn.imweb.me/thumbnail/20260221/739f765b08ded.png",
    imagePosition: "object-[72%_18%]",
  },
  {
    title: "공급사에 요청할 재질 문서를 정리하는 법",
    date: "2026.08.09",
    desc: "TDS, 시험성적서, 선언 자료를 요청할 때 빠뜨리기 쉬운 기준을 살펴봅니다.",
    image: "https://tika-immobilier.fr/storage/2025/04/image-15-1024x683.png",
    imagePosition: "object-[42%_52%]",
  },
  {
    title: "EPR 보고 전에 SKU 데이터를 다듬는 순서",
    date: "2026.08.02",
    desc: "재질, 중량, 구성품 정보를 보고 가능한 단위로 정리하는 실무 흐름입니다.",
    image: "https://www.okonrecycling.com/wp-content/uploads/2025/07/office-recycling-bins-paper-plastic-desk-financial-charts.png",
    imagePosition: "object-[86%_56%]",
  },
];

const prompts = [
  "PET 병에 필요한 증빙을 알려줘",
  "PFAS 자료가 없으면 어떤 리스크가 있어?",
  "DoC 발행 전 확인할 항목을 정리해줘",
];

export default function HomePage() {
  const { user, loading } = useSession();
  const [selectedStep, setSelectedStep] = useState(0);
  const [chatPrompt, setChatPrompt] = useState(prompts[0]);

  const selectedAnswer = useMemo(() => {
    if (chatPrompt.includes("PFAS")) {
      return "PFAS 적합성 자료가 없으면 제한 물질 확인 단계가 보류됩니다. 공급사 성적서와 시험성적서를 먼저 확보하세요.";
    }
    if (chatPrompt.includes("DoC")) {
      return "DoC 전에는 제품명, 포장 구성, 재질명, 관련 시험 자료, 책임 주체 정보가 서로 맞는지 확인합니다.";
    }
    return "PET 병은 원료 TDS, 재활용성 근거, 중금속 시험, 용기 도면, 공급사 선언 자료를 우선 확인합니다.";
  }, [chatPrompt]);

  return (
    <div className="overflow-hidden bg-[#f7faf7] text-ink">
      <section className="ppwr-hero-bg relative isolate min-h-[700px] overflow-visible px-4 pb-0 pt-14 text-white md:min-h-[760px] md:pt-16">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.32),0_18px_50px_rgba(0,0,0,0.36)] backdrop-blur">
            <PackageCheck className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-6 max-w-4xl text-center text-3xl font-semibold leading-[1.08] tracking-tight text-white md:text-5xl">
            AI 기반의 PPWR 규제 대응 서비스
          </h1>
          <p className="mt-5 text-center text-lg leading-relaxed text-white/80">
            제품 등록부터 증빙 검토, 제출 문서 준비까지
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {!loading && (
              <Link
                href={user ? "/app" : "/auth/signup"}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-slate-100 active:scale-[0.98]"
              >
                {user ? "대시보드" : "무료로 시작"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          <div className="relative z-10 mt-10 w-full max-w-6xl translate-y-14 md:mt-14 md:translate-y-20">
            <div className="hero-product-shot aspect-[16/10] w-[78%] min-w-[760px] overflow-hidden rounded-2xl border border-white/18 bg-white/92 p-2 shadow-[0_30px_110px_rgba(0,0,0,0.46)] max-md:aspect-[4/3] max-md:min-w-0 max-md:w-full">
              <img
                src={`${BASE_PATH}/component-detail.png`}
                alt="PPWR 부품 상세 서비스 화면"
                className="h-full w-full rounded-xl object-cover object-top"
              />
            </div>

            <div className="absolute right-0 top-[-18%] w-[42%] min-w-[380px] rounded-2xl border border-white/38 bg-white/72 p-6 text-ink shadow-[0_28px_90px_rgba(0,0,0,0.34)] backdrop-blur-xl max-md:relative max-md:top-auto max-md:mt-4 max-md:w-full max-md:min-w-0">
              <h2 className="text-xl font-semibold">1. 포장 데이터</h2>
              <p className="mt-8 text-sm leading-relaxed text-slate-600">
                보호해야 할 제품과 포장 구성을 선택하세요.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border-2 border-ink bg-white px-4 py-3 text-center text-sm font-semibold">
                  용기·캡
                </div>
                <div className="rounded-xl border border-white/80 bg-white/80 px-4 py-3 text-center text-sm font-semibold text-slate-600">
                  라벨·박스
                </div>
              </div>
              <p className="mt-8 text-sm leading-relaxed text-slate-600">
                필요한 증빙 유형을 선택하면 AI가 누락 자료를 정리합니다.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {["재질", "시험", "선언"].map((item) => (
                  <div key={item} className="min-h-28 rounded-xl border border-slate-200 bg-white p-4">
                    <div className="mb-5 h-8 w-8 rounded-lg bg-primary-soft" />
                    <p className="text-sm font-semibold">{item}</p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">자동 검토</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-[#f7faf7] px-4 pb-20 pt-24 md:pt-32">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 -translate-y-full bg-gradient-to-b from-transparent via-[#f7faf7]/55 to-[#f7faf7]" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <h2 className="max-w-lg text-2xl font-semibold leading-tight md:text-4xl">
              질문하면 필요한 자료가 정리됩니다.
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-slate-600">
              챗봇은 입력된 제품 정보와 PPWR 기준을 함께 보며 다음 액션을 제안합니다.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {prompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setChatPrompt(prompt)}
                  className={
                    "rounded-xl border px-4 py-2 text-sm font-semibold transition active:scale-[0.98] " +
                    (chatPrompt === prompt
                      ? "border-primary bg-primary text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-primary/40")
                  }
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_24px_70px_rgba(67,85,74,0.12)]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Bot className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold">PPWR Assistant</p>
                  <p className="text-xs text-slate-500">제품 정보 기반 답변</p>
                </div>
              </div>
              <MessageSquareText className="h-5 w-5 text-slate-300" />
            </div>
            <div className="space-y-4 py-6">
              <div className="ml-auto max-w-[78%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm font-medium leading-relaxed text-white">
                {chatPrompt}
              </div>
              <div className="max-w-[86%] rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-700">
                {selectedAnswer}
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {["필수 문서", "보완 필요", "다음 작업"].map((item) => (
                  <div key={item} className="rounded-xl bg-[#f1f6f1] p-3">
                    <p className="text-xs font-semibold text-primary">{item}</p>
                    <p className="mt-1 text-xs text-slate-500">자동 분류</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="flex-1 text-sm text-slate-400">제품명, 재질, 문서 상태를 입력해보세요</span>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white transition active:scale-[0.96]">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f7faf7] py-14">
        <div className="logo-marquee overflow-hidden">
          <div className="logo-track flex w-max items-center gap-14">
            {[...revationClientLogos, ...revationClientLogos].map((src, index) => (
              <div key={`${src}-${index}`} className="flex h-16 w-36 shrink-0 items-center justify-center">
                <img
                  src={src}
                  alt="리베이션 고객사 로고"
                  className="max-h-10 max-w-32 object-contain opacity-100 grayscale contrast-150 brightness-75"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-24">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-2xl font-semibold leading-tight md:text-4xl">
              규제 대응은 세 장면으로 나뉩니다.
            </h2>
            <div className="mt-8 space-y-3">
              {steps.map((step, index) => (
                <button
                  key={step.title}
                  onClick={() => setSelectedStep(index)}
                  className={
                    "w-full rounded-2xl border p-5 text-left transition active:scale-[0.99] " +
                    (selectedStep === index
                      ? "border-primary bg-primary text-white shadow-[0_20px_60px_rgba(67,85,74,0.18)]"
                      : "border-slate-200 bg-white text-ink hover:border-primary/40")
                  }
                >
                  <span className="text-lg font-semibold">{step.title}</span>
                  <span className={selectedStep === index ? "mt-2 block text-sm text-white/75" : "mt-2 block text-sm text-slate-500"}>
                    {step.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative min-h-[520px] overflow-hidden rounded-2xl bg-[#eef8ec] p-8">
            <div className="absolute right-8 top-8 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-primary">
              {steps[selectedStep].title}
            </div>
            <div className={"absolute left-[12%] top-[18%] h-64 w-64 bg-[#bdec8f] " + steps[selectedStep].shape} />
            <div className="absolute bottom-[12%] right-[14%] h-52 w-52 rounded-[44%_56%_64%_36%/52%_42%_58%_48%] bg-[#d6f6b8]" />
            <div className="relative mt-56 max-w-md rounded-2xl border border-white/70 bg-white/75 p-6 backdrop-blur">
              <PackageCheck className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-2xl font-semibold">{steps[selectedStep].title}</h3>
              <p className="mt-3 leading-relaxed text-slate-600">
                {steps[selectedStep].detail}
              </p>
              <Link href="/service" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                자세히 보기 <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-24">
        <div className="mx-auto w-full max-w-7xl">
          <h2 className="max-w-xl text-2xl font-semibold leading-tight md:text-4xl">
            핵심 서비스는 네 가지로 충분합니다.
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div key={service.title} className="min-h-64 rounded-2xl bg-[#edf1df] p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/70 text-primary">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-10 text-2xl font-semibold">{service.title}</h3>
                  <p className="mt-3 max-w-sm leading-relaxed text-slate-700">{service.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#f7faf7] px-4 py-24">
        <div className="mx-auto w-full max-w-7xl">
          <h2 className="text-2xl font-semibold md:text-4xl">
            {SUBSCRIPTION_ENABLED ? "요금제" : "서비스 요금"}
          </h2>
          {!SUBSCRIPTION_ENABLED && (
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              필요한 서비스만 건별 단가로 결제합니다. 별도 약정·정기결제가 없습니다.
            </p>
          )}
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {!SUBSCRIPTION_ENABLED
              ? SERVICE_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className={
                      "flex min-h-[420px] flex-col rounded-2xl border bg-white p-6 " +
                      (item.highlight ? "border-primary shadow-[0_24px_70px_rgba(67,85,74,0.14)]" : "border-slate-200")
                    }
                  >
                    <h3 className="text-xl font-semibold">{item.name}</h3>
                    <p className="mt-2 min-h-12 text-sm leading-relaxed text-slate-500">{item.tagline}</p>
                    <p className="mt-6 text-3xl font-semibold">{formatKRW(item.price)}</p>
                    <p className="mt-1 text-xs text-slate-400">{item.priceNote ?? `1${item.unit} 기준`}</p>
                    <ul className="mt-6 flex-1 space-y-3">
                      {item.features.slice(0, 4).map((feature) => (
                        <li key={feature} className="flex gap-2 text-sm leading-relaxed text-slate-600">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/app/billing"
                      className={
                        "mt-6 inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition active:scale-[0.98] " +
                        (item.highlight ? "bg-primary text-white hover:bg-primary-dark" : "border border-slate-200 text-primary hover:border-primary/40")
                      }
                    >
                      결제하기
                    </Link>
                  </div>
                ))
              : SUBSCRIPTION_TIERS.map((tier) => (
              <div
                key={tier.id}
                className={
                  "flex min-h-[420px] flex-col rounded-2xl border bg-white p-6 " +
                  (tier.highlight ? "border-primary shadow-[0_24px_70px_rgba(67,85,74,0.14)]" : "border-slate-200")
                }
              >
                <h3 className="text-xl font-semibold">{tier.name}</h3>
                <p className="mt-2 min-h-12 text-sm leading-relaxed text-slate-500">{tier.audience}</p>
                <p className="mt-6 text-3xl font-semibold">{tier.priceLabel}</p>
                <p className="mt-1 text-xs text-slate-400">{tier.priceSub}</p>
                <ul className="mt-6 flex-1 space-y-3">
                  {tier.features.slice(0, 4).map((feature) => (
                    <li key={feature} className="flex gap-2 text-sm leading-relaxed text-slate-600">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.cta.href}
                  className={
                    "mt-6 inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition active:scale-[0.98] " +
                    (tier.highlight ? "bg-primary text-white hover:bg-primary-dark" : "border border-slate-200 text-primary hover:border-primary/40")
                  }
                >
                  {tier.cta.label}
                </Link>
              </div>
                ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-24">
        <div className="mx-auto w-full max-w-7xl">
          <h2 className="max-w-xl text-2xl font-semibold leading-tight md:text-4xl">
            고객 사례는 문서 흐름에서 시작됩니다.
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {cases.map((item) => (
              <article
                key={item.title}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-primary/40 active:scale-[0.99]"
              >
                <div className="relative aspect-[1.35] overflow-hidden bg-primary-soft">
                  <img
                    src={item.image}
                    alt={`${item.title} 대문 이미지`}
                    className={"h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.03] " + item.imagePosition}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/28 to-transparent" />
                </div>
                <div className="p-6">
                  <p className="text-sm font-semibold text-primary">{item.date}</p>
                  <h3 className="mt-4 text-xl font-semibold leading-snug">{item.title}</h3>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
                    {item.desc}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7faf7] px-4 py-24">
        <div className="mx-auto w-full max-w-7xl">
          <h2 className="text-2xl font-semibold md:text-4xl">블로그</h2>
          <p className="mt-4 max-w-lg leading-relaxed text-slate-600">
            PPWR 실무자가 먼저 확인해야 할 규정, 문서, 데이터 정리법을 짧게 다룹니다.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.title}
                href="/app/resources"
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-primary/40 active:scale-[0.99]"
              >
                <div className="relative aspect-[1.35] overflow-hidden bg-primary-soft">
                  <img
                    src={post.image}
                    alt={`${post.title} 대문 이미지`}
                    className={"h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.03] " + post.imagePosition}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/28 to-transparent" />
                </div>
                <div className="p-6">
                  <p className="text-sm font-semibold text-primary">{post.date}</p>
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold leading-snug">{post.title}</h3>
                    <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
                    {post.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
