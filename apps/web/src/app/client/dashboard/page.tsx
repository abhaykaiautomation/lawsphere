import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  PlusCircle, FileText, Calendar, Clock,
  CheckCircle2, TrendingUp, ArrowRight, AlertCircle,
} from 'lucide-react';

export default async function ClientDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('lawsphere_token')?.value;
  try { if (!token) throw new Error(); verifyToken(token); } catch { redirect('/login'); }

  const mockStats = {
    activeCases: 2,
    upcomingConsultations: 1,
    documentsUploaded: 5,
    resolvedCases: 3,
  };

  const mockCases = [
    { id: '1', title: 'Property Dispute with Neighbour', status: 'MATCHED', urgency: 'HIGH', practiceArea: 'Property Law', createdAt: '2026-05-01' },
    { id: '2', title: 'Employee Termination Dispute', status: 'IN_CONSULTATION', urgency: 'MEDIUM', practiceArea: 'Employment Law', createdAt: '2026-04-28' },
  ];

  const mockAppointments = [
    { id: '1', lawyerName: 'Adv. Rahul Sharma', scheduledAt: '2026-05-10 10:00 AM', mode: 'VIDEO', status: 'CONFIRMED' },
  ];

  const stats = [
    { label: 'Active Cases', value: mockStats.activeCases, icon: FileText, color: 'bg-indigo-500', light: 'bg-indigo-50 text-indigo-600' },
    { label: 'Upcoming Consults', value: mockStats.upcomingConsultations, icon: Calendar, color: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-600' },
    { label: 'Documents', value: mockStats.documentsUploaded, icon: TrendingUp, color: 'bg-violet-500', light: 'bg-violet-50 text-violet-600' },
    { label: 'Resolved Cases', value: mockStats.resolvedCases, icon: CheckCircle2, color: 'bg-sky-500', light: 'bg-sky-50 text-sky-600' },
  ];

  const urgencyColor: Record<string, string> = {
    HIGH: 'bg-red-100 text-red-700',
    MEDIUM: 'bg-yellow-100 text-yellow-700',
    LOW: 'bg-green-100 text-green-700',
    CRITICAL: 'bg-red-200 text-red-800',
  };

  const statusColor: Record<string, string> = {
    MATCHED: 'bg-indigo-100 text-indigo-700',
    IN_CONSULTATION: 'bg-emerald-100 text-emerald-700',
    PENDING: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Track your cases and upcoming consultations</p>
        </div>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Link href="/client/intake">
            <PlusCircle className="h-4 w-4" />
            New Legal Issue
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500">{stat.label}</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.light}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cases */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">My Cases</h2>
            <Link href="/client/cases" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {mockCases.map((c) => (
              <Link key={c.id} href={`/client/cases/${c.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">{c.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{c.practiceArea} · {c.createdAt}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${urgencyColor[c.urgency] ?? ''}`}>{c.urgency}</span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[c.status] ?? 'bg-slate-100 text-slate-600'}`}>{c.status.replace('_', ' ')}</span>
                </div>
              </Link>
            ))}
            {mockCases.length === 0 && (
              <div className="px-6 py-12 text-center text-slate-400 text-sm">
                No cases yet.{' '}
                <Link href="/client/intake" className="text-indigo-600 hover:underline">Submit your first legal issue</Link>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Upcoming */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900 text-sm">Upcoming Consultations</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {mockAppointments.map((apt) => (
                <div key={apt.id} className="px-5 py-4">
                  <p className="font-medium text-sm text-slate-900">{apt.lawyerName}</p>
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-400">
                    <Clock className="h-3 w-3" />
                    {apt.scheduledAt}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">{apt.mode}</span>
                    <Button size="sm" asChild className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700">
                      <Link href={`/client/consultations/${apt.id}`}>Join</Link>
                    </Button>
                  </div>
                </div>
              ))}
              {mockAppointments.length === 0 && (
                <p className="px-5 py-8 text-center text-sm text-slate-400">No upcoming consultations</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900 text-sm">Quick Actions</h2>
            </div>
            <div className="p-3 space-y-1">
              {[
                { href: '/client/intake', icon: PlusCircle, label: 'New Legal Issue', color: 'text-indigo-600' },
                { href: '/lawyers', icon: Calendar, label: 'Find a Lawyer', color: 'text-emerald-600' },
                { href: '/client/documents', icon: FileText, label: 'Upload Documents', color: 'text-violet-600' },
                { href: '/client/cases', icon: AlertCircle, label: 'View All Cases', color: 'text-sky-600' },
              ].map((action) => (
                <Link key={action.href} href={action.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
                  <action.icon className={`h-4 w-4 ${action.color}`} />
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
