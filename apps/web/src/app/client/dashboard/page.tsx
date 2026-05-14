import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  PlusCircle, FileText, Calendar, Clock, CheckCircle2,
  TrendingUp, ArrowRight, AlertCircle, Scale, Shield, Brain, Star,
} from 'lucide-react';

function getUser(token?: string) {
  if (!token) return null;
  try { return verifyToken(token); } catch { return null; }
}

// ─── Public view ────────────────────────────────────────────────────────────
function PublicDashboard() {
  const steps = [
    { icon: Brain, title: 'Describe Your Issue', desc: 'Tell us in plain language — our AI classifies and scores urgency instantly.' },
    { icon: Scale, title: 'Get Matched', desc: 'We surface the top 5 verified lawyers best-suited to your case.' },
    { icon: Calendar, title: 'Book & Consult', desc: 'Pay securely and meet your lawyer via video, audio, or chat.' },
  ];
  return (
    <div className="space-y-10">
      <div className="relative bg-slate-900 rounded-3xl overflow-hidden p-10 md:p-14">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 opacity-90" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%)' }} />
        <div className="relative max-w-xl">
          <div className="inline-flex items-center gap-2 bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-full px-4 py-1.5 text-xs font-medium mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            AI-Powered Legal Platform for India
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
            Legal Help You Can <span className="text-indigo-400">Trust & Afford</span>
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed mb-8">
            Describe your legal problem in plain language. Our AI instantly classifies your issue, scores urgency, and connects you with the right verified lawyer.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700 gap-2 h-10 px-6">
              <Link href="/register"><PlusCircle className="h-4 w-4" />Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-600 text-white hover:bg-slate-800 h-10 px-6">
              <Link href="/lawyers">Browse Lawyers</Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Cases Resolved', value: '10,000+', icon: FileText, color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Verified Lawyers', value: '500+', icon: Shield, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Average Rating', value: '4.8 / 5', icon: Star, color: 'bg-amber-50 text-amber-600' },
          { label: 'Practice Areas', value: '15+', icon: Scale, color: 'bg-violet-50 text-violet-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 font-medium">{s.label}</span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${s.color}`}><s.icon className="h-4 w-4" /></div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
        <h2 className="text-lg font-bold text-slate-900 mb-6">How LawSphere Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div key={s.title} className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                <s.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm mb-1"><span className="text-indigo-400 mr-1">0{i + 1}.</span>{s.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Ready to resolve your legal matter?</h3>
          <p className="text-slate-500 text-sm mt-1">Sign in to file a case, track progress, and message your lawyer.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Button asChild variant="outline" className="h-10"><Link href="/login">Sign In</Link></Button>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700 h-10 gap-2">
            <Link href="/register">Create Account <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Authenticated view ──────────────────────────────────────────────────────
async function AuthenticatedDashboard({ userId }: { userId: string }) {
  const clientProfile = await prisma.clientProfile.findUnique({ where: { userId } });
  if (!clientProfile) return <PublicDashboard />;

  const [cases, appointments, resolvedCount] = await Promise.all([
    prisma.case.findMany({
      where: { clientProfileId: clientProfile.id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { practiceArea: true },
    }),
    prisma.appointment.findMany({
      where: { clientProfileId: clientProfile.id, status: { in: ['CONFIRMED', 'PENDING'] }, scheduledAt: { gte: new Date() } },
      orderBy: { scheduledAt: 'asc' },
      take: 3,
      include: { lawyerProfile: { select: { firstName: true, lastName: true } } },
    }),
    prisma.case.count({ where: { clientProfileId: clientProfile.id, status: 'RESOLVED', deletedAt: null } }),
  ]);

  const activeCases = cases.filter(c => !['RESOLVED', 'CLOSED'].includes(c.status)).length;

  const urgencyColor: Record<string, string> = {
    HIGH: 'bg-red-100 text-red-700', MEDIUM: 'bg-yellow-100 text-yellow-700',
    LOW: 'bg-green-100 text-green-700', CRITICAL: 'bg-red-200 text-red-800',
  };
  const statusColor: Record<string, string> = {
    MATCHED: 'bg-indigo-100 text-indigo-700', IN_CONSULTATION: 'bg-emerald-100 text-emerald-700',
    SUBMITTED: 'bg-blue-100 text-blue-700', PENDING: 'bg-slate-100 text-slate-600',
    DRAFT: 'bg-slate-100 text-slate-500',
  };

  const stats = [
    { label: 'Active Cases', value: activeCases, icon: FileText, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Upcoming Consults', value: appointments.length, icon: Calendar, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Total Cases', value: cases.length, icon: TrendingUp, color: 'bg-violet-50 text-violet-600' },
    { label: 'Resolved Cases', value: resolvedCount, icon: CheckCircle2, color: 'bg-sky-50 text-sky-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Welcome back, {clientProfile.firstName}</p>
        </div>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Link href="/client/intake"><PlusCircle className="h-4 w-4" />New Legal Issue</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500">{s.label}</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}><s.icon className="h-4 w-4" /></div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">My Cases</h2>
            <Link href="/client/cases" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="divide-y divide-slate-100">
            {cases.length === 0 && (
              <div className="px-6 py-12 text-center text-slate-400 text-sm">
                No cases yet. <Link href="/client/intake" className="text-indigo-600 hover:underline">Submit your first legal issue</Link>
              </div>
            )}
            {cases.map((c) => (
              <Link key={c.id} href={`/client/cases/${c.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">{c.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{c.practiceArea?.name ?? 'General'} · {c.createdAt.toLocaleDateString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${urgencyColor[c.urgency] ?? ''}`}>{c.urgency}</span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[c.status] ?? 'bg-slate-100 text-slate-600'}`}>{c.status.replace('_', ' ')}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900 text-sm">Upcoming Consultations</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {appointments.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-400">No upcoming consultations</p>}
              {appointments.map((apt) => (
                <div key={apt.id} className="px-5 py-4">
                  <p className="font-medium text-sm text-slate-900">Adv. {apt.lawyerProfile.firstName} {apt.lawyerProfile.lastName}</p>
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-400">
                    <Clock className="h-3 w-3" />{apt.scheduledAt.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">{apt.mode}</span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${apt.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>{apt.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100"><h2 className="font-semibold text-slate-900 text-sm">Quick Actions</h2></div>
            <div className="p-3 space-y-1">
              {[
                { href: '/client/intake', icon: PlusCircle, label: 'New Legal Issue', color: 'text-indigo-600' },
                { href: '/lawyers', icon: Calendar, label: 'Find a Lawyer', color: 'text-emerald-600' },
                { href: '/client/documents', icon: FileText, label: 'Upload Documents', color: 'text-violet-600' },
                { href: '/client/cases', icon: AlertCircle, label: 'View All Cases', color: 'text-sky-600' },
              ].map((action) => (
                <Link key={action.href} href={action.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
                  <action.icon className={`h-4 w-4 ${action.color}`} />{action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ClientDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('lawsphere_token')?.value;
  const payload = getUser(token);
  return payload ? <AuthenticatedDashboard userId={payload.sub} /> : <PublicDashboard />;
}
