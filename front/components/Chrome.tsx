"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

/**
 * /auth/* (인증) · /app/* (로그인 후 워크스페이스) 경로에서는
 * 마케팅 헤더/푸터를 숨기고 전용 레이아웃만 노출한다.
 */
export default function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare =
    pathname?.startsWith("/auth") || pathname?.startsWith("/app");

  if (bare) {
    return <main>{children}</main>;
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
