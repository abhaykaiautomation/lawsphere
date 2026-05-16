import { DashboardSidebar } from '@/components/layouts/dashboard-sidebar';
import { LegalAssistant } from '@/components/common/legal-assistant';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 ml-64">
        <div className="p-8">{children}</div>
      </main>
      {/* Floating AI legal assistant — visible across all client pages */}
      <LegalAssistant />
    </div>
  );
}
