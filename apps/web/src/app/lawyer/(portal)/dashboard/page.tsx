import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, Star, Users, Clock, CheckCircle, ArrowRight, TrendingUp } from 'lucide-react';

export default async function LawyerDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('lawsphere_token')?.value;
  let userId: string;
  try {
    if (!token) throw new Error();
    userId = verifyToken(token).sub;
  } catch { redirect('/login'); }

  const lawyerProfile = await prisma.lawyerProfile.findUnique({
    where: { userId },
    include: { practiceAreas: { include: { practiceArea: true }, take: 3 } },
  });
  if (!lawyerProfile) redirect('/lawyer/pending');

  const [appointments, totalAppointments, completedConsultations, recentEarnings] = await Promise.all([
    prisma.appointment.findMany({
      where: { lawyerProfileId: lawyerProfile.id, status: { in: ['CONFIRMED', 'PENDING'] }, scheduledAt: { gte: new Date() } },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
      include: { clientProfile: { select: { firstName: true, lastName: true } } },
    }),
    // All appointments ever (not just upcoming)
    prisma.appointment.count({ where: { lawyerProfileId: lawyerProfile.id } }),
    // Completed consultations
    prisma.appointment.count({ where: { lawyerProfileId: lawyerProfile.id, status: 'COMPLETED' } }),
    prisma.payment.aggregate({
      where: { lawyerProfileId: lawyerProfile.id, status: 'COMPLETED' },
      _sum: { lawyerPayout: true },
    }),
  ]);

  const totalEarnings = Number(recentEarnings._sum.lawyerPayout ?? 0);
  const pendingCount  = appointments.filter(a => a.status === 'PENDING').length;

  const stats = [
    { label: 'Upcoming Appointments', value: appointments.length,    icon: Calendar,  color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Pending Confirmation',  value: pendingCount,            icon: Clock,     color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Completed Sessions',    value: completedConsultations,  icon: Users,     color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Avg. Rating',           value: Number(lawyerProfile.averageRating) > 0 ? Number(lawyerProfile.averageRating).toFixed(1) : '—', icon: Star, color: 'bg-amber-50 text-amber-600' },
  ];

  const statusColor: Record<string, string> = {
    CONFIRMED: 'bg-emerald-100 text-emerald-700', PENDING: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lawyer Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Welcome back, {lawyerProfile.firstName}</p>
        </div>
        <Button variant="outline" asChild><Link href="/lawyer/profile">Edit Profile</Link></Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-500">{s.label}</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}><s.icon className="h-4 w-4" /></div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Upcoming Appointments</h2>
            <Link href="/lawyer/appointments" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="divide-y divide-slate-100">
            {appointments.length === 0 && <p className="px-6 py-12 text-center text-sm text-slate-400">No upcoming appointments</p>}
            {appointments.map((apt) => (
              <div key={apt.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0">
                  {apt.clientProfile.firstName[0]}{apt.clientProfile.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm">{apt.clientProfile.firstName} {apt.clientProfile.lastName}</p>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                    <Clock className="h-3 w-3" />{apt.scheduledAt.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[apt.status] ?? ''}`}>{apt.status}</span>
                  {apt.status === 'PENDING' ? (
                    <div className="flex gap-1.5">
                      <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700">Accept</Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs">Decline</Button>
                    </div>
                  ) : (
                    <Button size="sm" asChild className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700">
                      <Link href={`/lawyer/consultations/${apt.id}`}>Join</Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4"><TrendingUp className="h-4 w-4 text-slate-400" /><h2 className="font-semibold text-slate-900 text-sm">Profile</h2></div>
            <div className="space-y-3">
              {[
                { label: 'Experience', value: `${lawyerProfile.yearsOfExperience} yrs` },
                { label: 'Fee per session', value: `₹${Number(lawyerProfile.consultationFee).toLocaleString('en-IN')}` },
                { label: 'Practice Areas', value: lawyerProfile.practiceAreas.map(a => a.practiceArea.name).join(', ') || '—' },
                { label: 'City', value: lawyerProfile.city ?? '—' },
              ].map(s => (
                <div key={s.label} className="flex justify-between text-sm">
                  <span className="text-slate-400">{s.label}</span>
                  <span className="font-semibold text-slate-900 text-right max-w-[160px] truncate">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {!lawyerProfile.isProfileComplete && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Complete Your Profile</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">Add your bio and upload your Bar Council certificate to attract more clients.</p>
                  <Button size="sm" asChild className="mt-3 h-7 text-xs bg-amber-500 hover:bg-amber-600 border-0">
                    <Link href="/lawyer/profile">Complete Now</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
