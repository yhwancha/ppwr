import Sidebar from "@/components/app/Sidebar";
import { ToastProvider } from "@/components/ui/Toast";
import AppFooter from "@/components/app/AppFooter";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        {/* 사업자정보(AppFooter)는 결제 페이지 포함 /app/* 전체에 상시 노출된다 — PG 심사 요건 */}
        <div className="flex min-h-screen flex-col pl-60">
          <div className="flex-1">{children}</div>
          <AppFooter />
        </div>
      </div>
    </ToastProvider>
  );
}
