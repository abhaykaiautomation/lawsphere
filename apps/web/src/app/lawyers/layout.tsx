import { DashboardSidebar } from '@/components/layouts/dashboard-sidebar';

export default function LawyersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 ml-64">{children}</main>
    </div>
  );
}
