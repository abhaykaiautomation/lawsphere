import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SignInPrompt } from '@/components/layouts/sign-in-prompt';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Video, Phone, MessageSquare, PlusCircle } from 'lucide-react';

const modeIcon = { VIDEO: Video, AUDIO: Phone, CHAT: MessageSquare };
const statusColor: Record<string, string> = {
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
  PENDING:   'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-slate-100 text-slate-600',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default async function ConsultationsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('lawsphere_token')?.value;
  let userId: string;
  try {
    if (!token) throw new Error();
    userId = verifyToken(token).sub;
  } catch {
    return <SignInPrompt message="Sign in to view your consultations" />;
  }

  const clientProfile = await prisma.clientProfile.findUnique({ where: { userId } });

  const appointments = clientProfile
    ? await prisma.appointment.findMany({
        where: { clientProfileId: clientProfile.id },
        orderBy: { scheduledAt: 'desc' },
        include: {
          lawyerProfile: { select: { firstName: true, lastName: true, consultationFee: true } },
          case: { select: { title: true } },
        },
      })
    : [];

  const now      = new Date();
  const upcoming = appointments.filter(a => new Date(a.scheduledAt) >= now && a.status !== 'CANCELLED');
  const past     = appointments.filter(a => new Date(a.scheduledAt) < now || a.status === 'COMPLETED' || a.status === 'CANCELLED');

  function AppointmentRow({ apt, isPast }: { apt: typeof appointments[0]; isPast: boolean }) {
    const Icon = modeIcon[apt.mode as keyof typeof modeIcon] ?? Video;
    const fee  = Number(apt.lawyerProfile.consultationFee);
    const aptTime = new Date(apt.scheduledAt);

    return (
      <Link
        href={`/client/consultations/${apt.id}`}
        className="flex items-center gap-4 px-6 py-5 hover:bg-slate-50 transition-colors"
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isPast ? 'bg-slate-100' : 'bg-indigo-50'}`}>
          <Icon className={`h-5 w-5 ${isPast ? 'text-slate-400' : 'text-indigo-500'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 text-sm">
            Adv. {apt.lawyerProfile.firstName} {apt.lawyerProfile.lastName}
          </p>
          {apt.case && <p className="text-xs text-slate-400 mt-0.5 truncate">{apt.case.title}</p>}
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
            <Clock className="h-3 w-3" />
            {aptTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            {' · '}
            {aptTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            {' · '}{apt.durationMin} min
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">₹{fee.toLocaleString('en-IN')}</p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[apt.status] ?? 'bg-slate-100 text-slate-600'}`}>
              {apt.status}
            </span>
          </div>
          {apt.status === 'CONFIRMED' && !isPast && (
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs">
              View
            </Button>
          )}
        </div>
      </Link>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Consultations</h1>
          <p className="text-slate-500 text-sm mt-0.5">Your upcoming and past consultations</p>
        </div>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Link href="/lawyers"><PlusCircle className="h-4 w-4" />Book New</Link>
        </Button>
      </div>

      {/* Upcoming */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <Calendar className="h-4 w-4 text-indigo-500" />Upcoming ({upcoming.length})
        </h2>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {upcoming.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-slate-400 mb-3">No upcoming consultations</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/lawyers">Find a Lawyer</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcoming.map(apt => <AppointmentRow key={apt.id} apt={apt} isPast={false} />)}
            </div>
          )}
        </div>
      </div>

      {/* Past */}
      {past.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Past ({past.length})</h2>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {past.map(apt => <AppointmentRow key={apt.id} apt={apt} isPast={true} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
