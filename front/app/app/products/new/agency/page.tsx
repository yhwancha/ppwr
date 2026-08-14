"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import Topbar from "@/components/app/Topbar";

export default function AgencyRequestPage() {
  const [done, setDone] = useState(false);
  const [f, setF] = useState<Record<string, string>>({
    company: "", manager: "", email: "", phone: "",
    product_overview: "", quantity: "", detail: "",
  });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  return (
    <>
      <Topbar crumbs={[{ label: "제품 관리", href: "/app/products" }, { label: "제품 등록 대행 신청" }]} />
      <div className="mx-auto max-w-3xl px-8 pb-16">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ink">제품 등록 대행 신청</h1>
            <p className="mt-1 text-sm text-slate-400">
              정보 입력이 어려우신가요? 리베이션 전문가가 제품·포장 정보 등록을 대신 진행해 드립니다.
            </p>
          </div>
        </div>

        {done ? (
          <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </span>
            <p className="mt-4 text-lg font-semibold text-ink">신청이 접수되었습니다</p>
            <p className="mt-2 text-sm text-slate-500">담당 컨설턴트가 영업일 기준 1~2일 내 연락드립니다.</p>
            <Link href="/app/products" className="mt-6 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
              제품 관리로 돌아가기
            </Link>
          </div>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); setDone(true); }}
            className="mt-6 space-y-4"
          >
            <Section title="신청 기업 정보">
              <Grid>
                <Field label="기업명" required value={f.company} onChange={set("company")} placeholder="(주)리베이션" />
                <Field label="담당자명" required value={f.manager} onChange={set("manager")} placeholder="홍길동" />
                <Field label="이메일" required type="email" value={f.email} onChange={set("email")} placeholder="name@company.com" />
                <Field label="전화번호" value={f.phone} onChange={set("phone")} placeholder="010-0000-0000" />
              </Grid>
            </Section>

            <Section title="대행 요청 제품 정보">
              <Grid>
                <Field label="제품 개요" value={f.product_overview} onChange={set("product_overview")} placeholder="예: 세럼 라인 3종" />
                <Field label="제품 수량" type="number" value={f.quantity} onChange={set("quantity")} placeholder="예: 3" />
              </Grid>
              <div className="mt-5">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">요청 내용</label>
                <textarea rows={4} value={f.detail} onChange={set("detail")}
                  placeholder="대행이 필요한 범위(제품 등록 / 포장 BOM / 증빙 정리 등)와 특이사항을 적어주세요."
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none placeholder:text-slate-300 focus:border-primary" />
              </div>
              <label className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" required className="h-4 w-4 accent-[#43554a]" />
                제출 정보 확인 및 처리에 동의합니다 <span className="text-danger">*</span>
              </label>
            </Section>

            <div className="flex justify-end gap-2">
              <Link href="/app/products" className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">취소</Link>
              <button type="submit" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">신청하기</button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8">
      <h2 className="mb-5 text-lg font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}
function Grid({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}
function Field({ label, value, onChange, required, type = "text", placeholder }: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none placeholder:text-slate-300 focus:border-primary" />
    </div>
  );
}
