import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import { DashboardSidebar } from '@/components/layouts/dashboard-sidebar';
import { LegalAssistant } from '@/components/common/legal-assistant';

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('lawsphere_token')?.value;

  if (token) {
    try {
      const { role } = verifyToken(token);
      // Redirect non-clients to their own portal
      if (role === 'ADMIN')  redirect('/admin/dashboard');
      if (role === 'LAWYER') redirect('/lawyer/dashboard');
    } catch {
      // Invalid token — client/dashboard handles its own public/auth split
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 ml-64">
        <div className="p-8">{children}</div>
      </main>
      <LegalAssistant />
    </div>
  );
}
