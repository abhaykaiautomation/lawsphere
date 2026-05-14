import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SignInPrompt } from '@/components/layouts/sign-in-prompt';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, Video, Phone, Clock, Calendar,
  CheckCircle2, AlertCircle, MessageSquare, FileText,
} from 'lucide-react';

export default async function ConsultationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get('lawsphere_token')?.value;
  let userId: string;
  try {
    if (!token) throw new Error();
    userId = verifyToken(token).sub;
  } catch {
    return <SignInPrompt message="Sign in to view your consultation" />;
  }

  const clientProfile = await prisma.clientProfile.findUnique({ where: { userId } });
  if (!clientProfile) return <SignInPrompt message="Sign in to view your consultation" />;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      lawyerProfile: {
        select: { firstName: true, lastName: true, slug: true, consultationFee: true, city: true },
      },
      case: { select: { id: true, title: true, caseNumber: true } },
    },
  });

  if (!appointment || appointment.clientProfileId !== clientProfile.id) return notFound();

  const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2; desc: string }> = {
    PENDING:   { label: 'Awaiting Confirmation', color: 'bg-yellow-100 text-yellow-700', icon: Clock, desc: 'The lawyer has not yet confirmed this appointment.' },
    CONFIRMED: { label: 'Confirmed',              color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2, desc: 'Your appointment is confirmed.' },
    COMPLETED: { label: 'Completed',              color: 'bg-slate-100 text-slate-600', icon: CheckCircle2, desc: 'This consultation has been completed.' },
    CANCELLED: { label: 'Cancelled',              color: 'bg-red-100 text-red-700', icon: AlertCircle, desc: 'This appointment was cancelled.' },
  };

  const status = statusConfig[appointment.status] ?? statusConfig.PENDING;
  const StatusIcon = status.icon;
  const fee        = Number(appointment.lawyerProfile.consultationFee);
  const now        = new Date();
  const aptTime    = new Date(appointment.scheduledAt);
  const isJoinable = appointment.status === 'CONFIRMED' &&
    aptTime.getTime() - now.getTime() < 10 * 60 * 1000 &&
    now.getTime() < aptTime.getTime() + 60 * 60 * 1000;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/client/consultations" className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Consultation Details</h1>
          <p className="text-slate-500 text-sm mt-0.5">#{appointment.appointmentNumber}</p>
        </div>
      </div>

      {/* Status banner */}
      <div className={`flex items-start gap-3 p-4 rounded-2xl border ${appointment.status === 'PENDING' ? 'bg-yellow-50 border-yellow-100' : appointment.status === 'CONFIRMED' ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
        <StatusIcon className={`h-5 w-5 shrink-0 mt-0.5 ${appointment.status === 'PENDING' ? 'text-yellow-600' : appointment.status === 'CONFIRMED' ? 'text-emerald-600' : 'text-slate-500'}`} />
        <div>
          <p className="font-semibold text-slate-900 text-sm">{status.label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{status.desc}</p>
        </div>
        <span className={`ml-auto text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${status.color}`}>{status.label}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Appointment details */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-5">Appointment Details</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <Calendar className="h-4 w-4 text-indigo-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Date & Time</p>
                <p className="text-sm font-semibold text-slate-900">
                  {aptTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-xs text-slate-500">
                  {aptTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · {appointment.durationMin} minutes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                {appointment.mode === 'VIDEO' ? <Video className="h-4 w-4 text-emerald-500" /> : <Phone className="h-4 w-4 text-emerald-500" />}
              </div>
              <div>
                <p className="text-xs text-slate-400">Mode</p>
                <p className="text-sm font-semibold text-slate-900">{appointment.mode === 'VIDEO' ? 'Video Call' : 'Audio Call'}</p>
              </div>
            </div>

            {appointment.clientNotes && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Your Notes</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{appointment.clientNotes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lawyer & payment */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Lawyer</h2>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                {appointment.lawyerProfile.firstName[0]}{appointment.lawyerProfile.lastName[0]}
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">
                  Adv. {appointment.lawyerProfile.firstName} {appointment.lawyerProfile.lastName}
                </p>
                {appointment.lawyerProfile.city && (
                  <p className="text-xs text-slate-400">{appointment.lawyerProfile.city}</p>
                )}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" asChild className="flex-1 gap-1.5 h-8 text-xs">
                <Link href={`/lawyers/${appointment.lawyerProfile.slug}`}>View Profile</Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="flex-1 gap-1.5 h-8 text-xs">
                <Link href="/client/messages"><MessageSquare className="h-3.5 w-3.5" />Message</Link>
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="font-semibold text-slate-900 mb-4 text-sm">Payment Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Consultation fee</span><span>₹{fee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-xs">
                <span>Platform fee (10%)</span><span>₹{Math.round(fee * 0.1).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 border-t border-slate-100 pt-2">
                <span>Total</span><span>₹{Math.round(fee * 1.1).toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className={`mt-3 text-xs text-center font-medium py-2 rounded-xl ${appointment.status === 'CONFIRMED' ? 'bg-yellow-50 text-yellow-700' : 'bg-slate-50 text-slate-400'}`}>
              {appointment.status === 'CONFIRMED' ? '⏳ Payment due after session' : appointment.status === 'COMPLETED' ? '✓ Paid' : 'Pending lawyer confirmation'}
            </div>
          </div>
        </div>
      </div>

      {/* Case link */}
      {appointment.case && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Linked Case</p>
            <p className="font-semibold text-slate-900 text-sm">{appointment.case.title}</p>
            <p className="text-xs text-slate-400">{appointment.case.caseNumber}</p>
          </div>
          <Button variant="outline" size="sm" asChild className="h-8 text-xs">
            <Link href={`/client/cases/${appointment.case.id}`}>View Case</Link>
          </Button>
        </div>
      )}

      {/* Join / cancel */}
      <div className="flex gap-3">
        {isJoinable && (
          <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-12 font-semibold gap-2">
            {appointment.mode === 'VIDEO' ? <Video className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
            Join Consultation Now
          </Button>
        )}
        {!isJoinable && appointment.status === 'CONFIRMED' && (
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-500 text-center">
            Join button appears 10 minutes before the scheduled time
          </div>
        )}
        {appointment.status === 'PENDING' && (
          <div className="flex-1 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-700 text-center">
            Waiting for lawyer to confirm your appointment
          </div>
        )}
      </div>
    </div>
  );
}
