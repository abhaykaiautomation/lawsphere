import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Video, Phone, MessageSquare } from 'lucide-react';

const upcoming = [
  { id: '1', lawyerName: 'Adv. Rahul Sharma', scheduledAt: '2026-05-16 10:00 AM', mode: 'VIDEO', status: 'CONFIRMED', issue: 'Property Dispute', fee: 2500 },
  { id: '2', lawyerName: 'Adv. Priya Nair', scheduledAt: '2026-05-18 3:00 PM', mode: 'AUDIO', status: 'PENDING', issue: 'Employment Dispute', fee: 1800 },
];
const past = [
  { id: '3', lawyerName: 'Adv. Sanjay Patel', scheduledAt: '2026-04-20 11:00 AM', mode: 'VIDEO', status: 'COMPLETED', issue: 'Contract Review', fee: 2000, rating: 5 },
  { id: '4', lawyerName: 'Adv. Meena Iyer', scheduledAt: '2026-03-15 2:00 PM', mode: 'CHAT', status: 'COMPLETED', issue: 'Family Law', fee: 1500, rating: 4 },
];

const modeIcon = { VIDEO: Video, AUDIO: Phone, CHAT: MessageSquare };
const statusColor: Record<string, string> = {
  CONFIRMED: 'bg-emerald-100 text-emerald-700', PENDING: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-slate-100 text-slate-600',
};

export default function ConsultationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Consultations</h1>
        <p className="text-slate-500 text-sm mt-0.5">Your upcoming and past consultations</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Upcoming</h2>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {upcoming.map((apt) => {
              const Icon = modeIcon[apt.mode as keyof typeof modeIcon] ?? Video;
              return (
                <div key={apt.id} className="flex items-center gap-4 px-6 py-5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm">{apt.lawyerName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{apt.issue}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                      <Clock className="h-3 w-3" />{apt.scheduledAt}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">₹{apt.fee.toLocaleString('en-IN')}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[apt.status]}`}>{apt.status}</span>
                    </div>
                    {apt.status === 'CONFIRMED' && (
                      <Button size="sm" asChild className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs">
                        <Link href={`/client/consultations/${apt.id}`}>Join</Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            {upcoming.length === 0 && <p className="px-6 py-12 text-center text-sm text-slate-400">No upcoming consultations</p>}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Past</h2>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {past.map((apt) => {
              const Icon = modeIcon[apt.mode as keyof typeof modeIcon] ?? Video;
              return (
                <div key={apt.id} className="flex items-center gap-4 px-6 py-5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm">{apt.lawyerName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{apt.issue} · {apt.scheduledAt}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-slate-400">{'★'.repeat(apt.rating ?? 0)}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[apt.status]}`}>{apt.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
