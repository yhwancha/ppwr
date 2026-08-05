"use client";

import Link from "next/link";
import { useSession } from "@/src/features/auth/session";

/**
 * 구독 요금제 CTA.
 *  - 문의(mailto) CTA(기업형)는 그대로 메일 링크.
 *  - 그 외(무료/구독 시작)는 로그인 여부에 따라:
 *      비로그인 → /auth/login (로그인 후 결제·구독은 대시보드에서)
 *      로그인   → /app (대시보드)
 */
export default function TierCta({
  label,
  href,
  highlight,
}: {
  label: string;
  href: string;
  highlight?: boolean;
}) {
  const { user } = useSession();
  const isContact = href.startsWith("mailto:");
  const target = isContact ? href : user ? "/app" : "/auth/login";

  const cls =
    "mt-5 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold transition-colors " +
    (highlight
      ? "bg-primary text-white hover:bg-primary-dark"
      : "bg-primary-soft text-primary hover:bg-primary-light/50");

  if (isContact) {
    return (
      <a href={target} className={cls}>
        {label}
      </a>
    );
  }
  return (
    <Link href={target} className={cls}>
      {label}
    </Link>
  );
}
