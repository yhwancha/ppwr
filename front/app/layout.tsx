import type { Metadata } from "next";
import "./globals.css";
import Chrome from "@/components/Chrome";
import ReactQueryProvider from "@/app/_provider/ReactQueryProvider";

export const metadata: Metadata = {
  title: "EU 포장폐기물 규정 AI 진단 | PPWR REPORTING",
  description:
    "제품과 포장 구조를 입력하면 EU PPWR 규제 미이행 리스크를 즉시 진단하고, 공급사 제출용 정보요청서(RFI)까지 자동으로 매핑해 드립니다.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <ReactQueryProvider>
          <Chrome>{children}</Chrome>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
