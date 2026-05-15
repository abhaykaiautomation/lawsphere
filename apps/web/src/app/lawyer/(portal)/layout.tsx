import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardSidebar } from '@/components/layouts/dashboard-sidebar';

export default async function LawyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('lawsphere_token')?.value;

  // 1. Must be authenticated
  if (!token) redirect('/login');

  let payload: { sub: string; role: string };
  try {
    payload = verifyToken(token);
  } catch {
    redirect('/login');
  }

  // 2. Must be LAWYER role
  if (payload!.role !== 'LAWYER') {
    // Redirect other roles to their own portal
    if (payload!.role === 'ADMIN')  redirect('/admin/dashboard');
    if (payload!.role === 'CLIENT') redirect('/client/dashboard');
    redirect('/login');
  }

  // 3. Check approval status
  const user = await prisma.user.findUnique({
    where: { id: payload!.sub },
    select: { status: true },
  });

  if (!user || user.status === 'PENDING_VERIFICATION') redirect('/lawyer/pending');
  if (user.status === 'INACTIVE' || user.status === 'SUSPENDED') redirect('/login');

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 ml-64">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
