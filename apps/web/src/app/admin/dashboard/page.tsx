import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, Scale, FileText, DollarSign, ShieldCheck, AlertTriangle, ArrowRight, ArrowUpRight } from 'lucide-react';

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('lawsphere_token')?.value;
  try { if (!token) throw new Error(); verifyToken(token); } catch { redirect('/login'); }

  const stats = [
    { label: 'Total Users', value: '12,340', change: '+8%', icon: Users, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Verified Lawyers', value: '523', change: '+3%', icon: Scale, color: 'bg-violet-50 text-violet-600' },
    { label: 'Total Cases', value: '8,921', change: '+23%', icon: FileText, color: 'bg-sky-50 text-sky-600' },
    { label: 'Platform Revenue', value: '₹24.6L', change: '+18%', icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Pending Verifications', value: '7', change: '', icon: ShieldCheck, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Open Disputes', value: '2', change: '', icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
  ];

  const pendingLawyers = [
    { id: '1', name: 'Adv. Kavya Reddy', email: 'kavya@example.com', practiceArea: 'Family Law', submittedAt: '2026-05-06', barCouncil: 'KA/12345/2018' },
    { id: '2', name: 'Adv. Sanjay Patel', email: 'sanjay@example.com', practiceArea: 'Corporate Law', submittedAt: '2026-05-05', barCouncil: 'MH/98765/2015' },
    { id: '3', name: 'Adv. Meena Iyer', email: 'meena@example.com', practiceArea: 'Immigration Law', submittedAt: '2026-05-04', barCouncil: 'TN/45678/2020' },
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
            {s.change && <div className="flex items-center gap-1 mt-1.5 text-xs text-emerald-600 font-medium"><ArrowUpRight className="h-3.5 w-3.5" />{s.change} this month</div>}
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Pending Verifications</h2>
            <Link href="/admin/verifications" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingLawyers.map((l) => (
              <div key={l.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 text-xs font-bold shrink-0">{l.name.split(' ').map(n => n[0]).join('').slice(1, 3)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm">{l.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{l.email} · {l.practiceArea}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Bar: {l.barCouncil} · {l.submittedAt}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700">Approve</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50">Reject</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {[
            { href: '/admin/users', icon: Users, label: 'Manage Users', desc: 'View and manage all users', color: 'text-indigo-600 bg-indigo-50' },
            { href: '/admin/analytics', icon: DollarSign, label: 'Analytics', desc: 'Revenue and usage metrics', color: 'text-emerald-600 bg-emerald-50' },
            { href: '/admin/verifications', icon: ShieldCheck, label: 'Verifications', desc: 'Lawyer verification queue', color: 'text-yellow-600 bg-yellow-50' },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-indigo-100 hover:shadow-md transition-all">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}><item.icon className="h-5 w-5" /></div>
              <div><p className="font-semibold text-slate-900 text-sm">{item.label}</p><p className="text-xs text-slate-400 mt-0.5">{item.desc}</p></div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
