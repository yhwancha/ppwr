import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  FileText,
  FolderCheck,
  Gauge,
  History,
  Layers,
  Link2,
  ListChecks,
  Recycle,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "서비스 소개 – PPWR AI",
  description:
    "제품·포장재 정보를 한 번 입력하면 AI 사전진단부터 TD·DoC·EPR 기초자료까지 연결하는 PPWR 규제 대응 시스템.",
};

const pipeline = [
  "제품 등록",
  "AI 사전진단",
  "자료 보완",
  "TD 작성",
  "DoC 발행",
  "EPR 기초자료",
];

const coreServices = [
  {
    no: "01",
    icon: Gauge,
    title: "AI 기반 PPWR 사전진단",
    desc: "간단한 제품·포장재 정보만으로 현재 대응 수준을 우선 점검합니다. 단순 적합/부적합이 아니라, 확인 가능한 항목·추가 검토 항목·누락 정보·공급사 요청자료·시험 필요 항목으로 구분해 제공합니다.",
    points: [
      "포장재 구성 및 부품별 소재",
      "재활용 가능성·재생원료 함량 검토",
      "시험성적서·공급사 증빙 보유 여부",
      "기술문서 작성에 필요한 정보 충족도",
    ],
  },
  {
    no: "02",
    icon: FileText,
    title: "제품별 기술문서(TD) 작성 지원",
    desc: "AI 진단과 등록된 증빙자료를 기반으로 포장재의 PPWR 대응 근거를 정리한 Technical Documentation 작성을 지원합니다. 제품 정보가 바뀌면 처음부터 다시 쓰지 않고 데이터를 업데이트해 관리합니다.",
    points: [
      "제품·포장 단위 및 구성품 정보",
      "구성품별 소재·중량, 제조사·공급사",
      "규제 요건별 검토 결과",
      "시험성적서·인증서·증빙자료 목록",
    ],
  },
  {
    no: "03",
    icon: BadgeCheck,
    title: "EU 적합성 선언서(DoC) 제공",
    desc: "검토가 완료된 제품은 TD와 증빙자료를 기반으로 EU Declaration of Conformity 발행을 지원합니다. 등록된 제품 정보·TD 검토 결과에서 생성되어 문서 간 불일치를 줄이고 버전·발행 이력을 관리합니다.",
    points: [
      "포장재·책임 경제주체 식별정보",
      "적용 규정 및 검토 기준",
      "적합성 선언 내용",
      "관련 기술문서 식별정보·발행 이력",
    ],
  },
  {
    no: "04",
    icon: Recycle,
    title: "제품 EPR 기본자료 제공",
    desc: "PPWR 기술문서 대응에 사용한 포장재 데이터를 EPR 등록·보고 준비에 활용하도록 표준화해 제공합니다. (EPR 신고 자체를 자동 완료하는 서비스는 아니며, 국가별 등록 대상·책임주체·분담금은 별도 확인이 필요합니다.)",
    points: [
      "판매·묶음·운송 포장 구분",
      "구성품별 소재·중량, 소재별 총중량",
      "재생원료·재사용 포장 정보",
      "국가별 보고자료용 기초 데이터",
    ],
  },
];

const differentiators = [
  { icon: Layers, title: "한 번 등록한 데이터를 반복 활용", desc: "제품·포장재 정보를 한 번 등록하면 AI 진단·TD·DoC·EPR 기초자료에 연결해 활용합니다." },
  { icon: Boxes, title: "포장재 단위의 세부 관리", desc: "용기·캡·라벨·완충재·박스·운송 포장까지 구성품별 소재와 중량을 개별 관리합니다." },
  { icon: FolderCheck, title: "문서보다 먼저 근거자료 관리", desc: "시험성적서·인증서·공급사 확인서 등 문서 작성의 근거를 함께 관리합니다." },
  { icon: ListChecks, title: "부족한 자료를 구체적으로 안내", desc: "보유 자료와 추가 확보 자료를 구분하고, 공급사별 요청 자료를 정리합니다." },
  { icon: Link2, title: "TD·DoC·EPR 데이터의 연결", desc: "동일한 제품 데이터에서 필요한 정보를 연결해 문서 간 불일치와 반복 입력을 줄입니다." },
  { icon: History, title: "SKU별 변경 이력 관리", desc: "사양·소재·공급사·시험자료 변경 시 SKU별로 기록하고 최신 정보로 문서를 관리합니다." },
];

const steps = [
  ["STEP 1", "기업 및 제품 등록", "기업정보와 EU 수출 대상 제품을 등록합니다."],
  ["STEP 2", "포장재 구성 입력", "용기·캡·라벨·완충재·박스 등 포장 구성품을 등록합니다."],
  ["STEP 3", "AI 사전진단", "입력 정보를 바탕으로 대응 수준과 보완 필요 항목을 확인합니다."],
  ["STEP 4", "증빙자료 수집·검토", "시험성적서·소재 확인서·인증서·공급사 자료를 등록·보완합니다."],
  ["STEP 5", "TD 작성", "제품별 포장재 정보와 증빙을 기반으로 기술문서를 작성합니다."],
  ["STEP 6", "DoC 발행", "검토 완료된 기술문서를 기반으로 EU 적합성 선언서를 발행합니다."],
  ["STEP 7", "EPR 기초자료 확인", "소재·중량 정보를 취합해 국가별 EPR 보고용 기초자료를 제공합니다."],
];

const deliverables = [
  ["AI 진단 결과", "제품별 PPWR 대응 현황 및 보완 필요 항목"],
  ["자료 요청 목록", "공급사별 추가 확보 필요자료"],
  ["제품 데이터", "포장 구성품별 소재·중량·공급사 정보"],
  ["증빙자료 목록", "시험성적서·인증서·공급사 확인자료"],
  ["TD", "제품별 PPWR 기술문서"],
  ["DoC", "EU 적합성 선언서"],
  ["EPR 기본자료", "소재별 중량 및 국가별 보고 준비용 기초 데이터"],
  ["이력관리", "제품정보·증빙자료·문서 발행 버전 관리"],
];

const targets = [
  "EU에 제품을 수출 중이거나 준비하는 기업",
  "여러 공급사로부터 포장재를 조달하는 브랜드사",
  "제품별 포장재 구성·증빙자료 관리가 어려운 기업",
  "고객사로부터 PPWR 대응자료 제출을 요청받은 제조사",
  "TD·DoC 작성 근거를 체계적으로 관리해야 하는 기업",
  "국가별 EPR 신고용 포장재 중량정보가 필요한 기업",
  "다수 SKU를 관리하는 화장품·식품·생활용품·전자제품 기업",
];

export default function ServicePage() {
  return (
    <div className="bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(64,96,96,0.5),transparent_55%)]" />
        <div className="relative mx-auto w-full max-w-5xl px-6 py-24 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-primary-light">
            <Sparkles className="h-3.5 w-3.5" /> 포장재 규제 대응 시스템
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.2] md:text-5xl">
            EU PPWR 대응, 제품 등록부터
            <br />
            문서 발행까지 <span className="text-primary-light">한 번에</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-slate-300">
            포장재 정보를 입력하면 AI 사전진단부터 TD·DoC·EPR 기초자료까지 연결됩니다.
            제품별로 흩어진 소재 데이터·시험성적서·공급사 증빙을 하나의 SKU 단위로 관리하세요.
          </p>

          {/* 파이프라인 */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-sm">
            {pipeline.map((p, i) => (
              <span key={p} className="flex items-center gap-2">
                <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 font-semibold">
                  {p}
                </span>
                {i < pipeline.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-primary-light" />
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 핵심 서비스 */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Core Services
          </span>
          <h2 className="mt-3 text-3xl font-semibold text-ink">핵심 서비스</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {coreServices.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.no}
                className="rounded-2xl border border-slate-200 bg-white p-8"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-primary/30">{s.no}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.desc}</p>
                <ul className="mt-4 grid gap-2 border-t border-slate-100 pt-4 sm:grid-cols-2">
                  {s.points.map((p) => (
                    <li key={p} className="flex items-start gap-1.5 text-xs text-slate-500">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* 차별성 */}
      <section className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-24">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Why RESTUDIO
            </span>
            <h2 className="mt-3 text-3xl font-semibold text-ink">서비스 차별성</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {differentiators.map((d) => {
              const Icon = d.icon;
              return (
                <div key={d.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3 font-semibold text-ink">{d.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{d.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 이용 절차 */}
      <section className="mx-auto w-full max-w-4xl px-6 py-24">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            How to use
          </span>
          <h2 className="mt-3 text-3xl font-semibold text-ink">서비스 이용 절차</h2>
        </div>
        <div className="mt-12 space-y-3">
          {steps.map(([tag, title, desc]) => (
            <div
              key={tag}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5"
            >
              <span className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white">
                {tag}
              </span>
              <span className="font-semibold text-ink">{title}</span>
              <span className="flex-1 text-sm text-slate-500">{desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 제공 결과물 + 타겟 */}
      <section className="bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-24 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold text-ink">제공 결과물</h2>
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-slate-100">
                  {deliverables.map(([k, v]) => (
                    <tr key={k}>
                      <td className="w-40 bg-slate-50 px-4 py-3 font-semibold text-ink">{k}</td>
                      <td className="px-4 py-3 text-slate-500">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-ink">이런 기업에 필요합니다</h2>
            <ul className="mt-6 space-y-3">
              {targets.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 유의사항 + CTA */}
      <section className="mx-auto w-full max-w-4xl px-6 py-20">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-xs leading-relaxed text-slate-500">
          <p className="font-semibold text-slate-600">서비스 이용 유의사항</p>
          <p className="mt-2">
            본 서비스는 고객이 입력·제출한 제품정보 및 증빙자료를 기반으로 PPWR 대응 검토와 TD·DoC 작성,
            EPR 기초자료 구성을 지원합니다. AI 진단 결과는 사전 검토 결과이며 최종 적합성을 자동으로 보증·인증하지
            않습니다. 최종 규제 적합성에 대한 책임은 제조사·브랜드사·수입사 등 관련 법령상 책임 경제주체에 있습니다.
            EPR 책임주체·등록방법·보고항목·분담금은 판매 국가와 유통 구조에 따라 다르므로 국가별 별도 확인이 필요합니다.
          </p>
        </div>

        <div className="mt-10 text-center">
          <h3 className="text-2xl font-semibold text-ink">
            우리 제품의 PPWR 대응 수준을 먼저 확인해 보세요
          </h3>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              AI 사전진단 시작하기 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-7 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              요금제 보기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
