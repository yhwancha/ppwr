import { Construction } from "lucide-react";
import Topbar from "@/components/app/Topbar";

export default function ComingSoon({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items?: string[];
}) {
  return (
    <>
      <Topbar crumbs={[{ label: title }]} />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-8">
        <div className="max-w-lg text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Construction className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-2xl font-semibold text-ink">{title}</h1>
          <p className="mt-3 leading-relaxed text-slate-500">{description}</p>
          {items && (
            <ul className="mx-auto mt-6 inline-flex flex-col gap-2 text-left text-sm text-slate-500">
              {items.map((i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  {i}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-8 inline-flex rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-400">
            준비 중 · 다음 순서로 구현 예정
          </p>
        </div>
      </div>
    </>
  );
}
