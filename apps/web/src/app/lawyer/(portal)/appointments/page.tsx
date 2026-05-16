import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Clock, Video, Phone, Calendar } from 'lucide-react';

const statusColor: Record<string, string> = {
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
  PENDING:   'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-slate-100 text-slate-600',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default async function AppointmentsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('lawsphere_token')?.value;
  let userId: string;
  try {
    if (!token) throw new Error();
    userId = verifyToken(token).sub;
  } catch { redirect('/login'); }

  const lawyerProfile = await prisma.lawyerProfile.findUnique({ where: { userId } });
  if (!lawyerProfile) redirect('/lawyer/pending');

  const appointments = await prisma.appointment.findMany({
    where: { lawyerProfileId: lawyerProfile.id },
    orderBy: { scheduledAt: 'asc' },
    include: {
      clientProfile: { select: { firstName: true, lastName: true } },
      case: { select: { title: true } },
    },
  });

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd   = new Date(todayStart.getTime() + 86400000);
  const weekEnd    = new Date(todayStart.getTime() + 7 * 86400000);

  const todayCount   = appointments.filter(a => new Date(a.scheduledAt) >= todayStart && new Date(a.scheduledAt) < todayEnd).length;
  const weekCount    = appointments.filter(a => new Date(a.scheduledAt) >= todayStart && new Date(a.scheduledAt) < weekEnd).length;
  const pendingCount = appointments.filter(a => a.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
        <p className="text-slate-500 text-sm mt-0.5">Your client appointments</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Today',           value: todayCount,   color: 'bg-indigo-50 text-indigo-600' },
          { label: 'This Week',       value: weekCount,    color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Pending Confirm', value: pendingCount, color: 'bg-yellow-50 text-yellow-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-3xl font-bold text-slate-900">{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">All Appointments ({appointments.length})</h2>
        </div>

        {appointments.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Calendar className="h-8 w-8 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No appointments yet</p>
            <p className="text-xs text-slate-300 mt-1">Appointments will appear here once clients book with you</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.map((apt) => {
              const initials = `${apt.clientProfile.firstName[0]}${apt.clientProfile.lastName[0]}`;
              const aptTime  = new Date(apt.scheduledAt);
              return (
                <div key={apt.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm">
                      {apt.clientProfile.firstName} {apt.clientProfile.lastName}
                    </p>
                    {apt.case && <p className="text-xs text-slate-400 mt-0.5 truncate">{apt.case.title}</p>}
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                      <Clock className="h-3 w-3" />
                      {aptTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' · '}
                      {aptTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      {' · '}{apt.durationMin} min
                      {apt.mode === 'VIDEO'
                        ? <Video className="h-3 w-3 ml-1" />
                        : <Phone className="h-3 w-3 ml-1" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[apt.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {apt.status}
                    </span>
                    {apt.status === 'PENDING' && (
                      <div className="flex gap-1.5">
                        <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700">Accept</Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs">Decline</Button>
                      </div>
                    )}
                    {apt.status === 'CONFIRMED' && (
                      <Button size="sm" asChild className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700">
                        <Link href={`/lawyer/consultations/${apt.id}`}>Join</Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
