import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardSidebar } from '@/components/layouts/dashboard-sidebar';

export default async function LawyerLayout({ children }: { children: React.ReactNode }) {
  // /lawyer/pending is always accessible (it's the holding page itself)
  const cookieStore = await cookies();
  const token = cookieStore.get('lawsphere_token')?.value;

  if (token) {
    try {
      const payload = verifyToken(token);
      if (payload.role === 'LAWYER') {
        const user = await prisma.user.findUnique({
          where: { id: payload.sub },
          select: { status: true },
        });
        // Block access to all /lawyer/* except /lawyer/pending until approved
        if (user?.status === 'PENDING_VERIFICATION') {
          redirect('/lawyer/pending');
        }
      }
    } catch {
      // Invalid token — pages handle their own auth checks
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 ml-64">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
