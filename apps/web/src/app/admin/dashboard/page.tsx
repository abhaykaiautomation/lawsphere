import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, Scale, FileText, DollarSign, ShieldCheck, AlertTriangle, ArrowRight, ArrowUpRight } from 'lucide-react';

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('lawsphere_token')?.value;
  try {
    if (!token) throw new Error();
    const { role } = verifyToken(token);
    if (role !== 'ADMIN') redirect('/login');
  } catch { redirect('/login'); }

  const [totalUsers, totalLawyers, totalCases, pendingVerifications, revenue] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.lawyerProfile.count({ where: { verificationStatus: 'VERIFIED', deletedAt: null } }),
    prisma.case.count({ where: { deletedAt: null } }),
    prisma.lawyerProfile.count({ where: { verificationStatus: 'PENDING' } }),
    prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
  ]);

  const totalRevenue = Number(revenue._sum.amount ?? 0);

  const pendingLawyers = await prisma.lawyerProfile.findMany({
    where: { verificationStatus: 'PENDING' },
    take: 5,
    orderBy: { createdAt: 'asc' },
    include: {
      user: { select: { email: true } },
      practiceAreas: { include: { practiceArea: { select: { name: true } } }, take: 1 },
    },
  });

  const stats = [
    { label: 'Total Users', value: totalUsers.toLocaleString(), change: true, icon: Users, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Verified Lawyers', value: totalLawyers.toLocaleString(), change: true, icon: Scale, color: 'bg-violet-50 text-violet-600' },
    { label: 'Total Cases', value: totalCases.toLocaleString(), change: true, icon: FileText, color: 'bg-sky-50 text-sky-600' },
    { label: 'Platform Revenue', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, change: true, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Pending Verifications', value: pendingVerifications.toString(), change: false, icon: ShieldCheck, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Open Disputes', value: '0', change: false, icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-500">{s.label}</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}><s.icon className="h-4 w-4" /></div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{s.value}</p>
            {s.change && (
              <div className="flex items-center gap-1 mt-1.5 text-xs text-emerald-600 font-medium">
                <ArrowUpRight className="h-3.5 w-3.5" />Live data
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Pending Verifications</h2>
            <Link href="/admin/verifications" className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1 font-medium">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingLawyers.length === 0 && <p className="px-6 py-10 text-center text-sm text-slate-400">No pending verifications</p>}
            {pendingLawyers.map((l) => (
              <div key={l.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 text-xs font-bold shrink-0">
                  {l.firstName[0]}{l.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm">Adv. {l.firstName} {l.lastName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{l.user.email} · {l.practiceAreas[0]?.practiceArea.name ?? 'General'}</p>
                  {l.barCouncilNumber && <p className="text-xs text-slate-400 mt-0.5">Bar: {l.barCouncilNumber} · {l.city}</p>}
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Button size="sm" asChild className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700">
                    <Link href="/admin/verifications">Review</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {[
            { href: '/admin/users', icon: Users, label: 'Manage Users', desc: 'View and manage all users', color: 'text-indigo-600 bg-indigo-50' },
            { href: '/admin/analytics', icon: DollarSign, label: 'Analytics', desc: 'Revenue and usage metrics', color: 'text-emerald-600 bg-emerald-50' },
            { href: '/admin/verifications', icon: ShieldCheck, label: 'Verifications', desc: `${pendingVerifications} pending review`, color: 'text-yellow-600 bg-yellow-50' },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-violet-100 hover:shadow-md transition-all">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}><item.icon className="h-5 w-5" /></div>
              <div><p className="font-semibold text-slate-900 text-sm">{item.label}</p><p className="text-xs text-slate-400 mt-0.5">{item.desc}</p></div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
