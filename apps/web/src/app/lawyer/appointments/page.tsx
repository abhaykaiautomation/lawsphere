import { Button } from '@/components/ui/button';
import { Clock, Video, Phone } from 'lucide-react';

const appointments = [
  { id: '1', clientName: 'Rahul Mehta', scheduledAt: '2026-05-16 11:00 AM', mode: 'VIDEO', status: 'CONFIRMED', issue: 'Property dispute', fee: 2500 },
  { id: '2', clientName: 'Priya Singh', scheduledAt: '2026-05-17 3:00 PM', mode: 'VIDEO', status: 'PENDING', issue: 'Employment termination', fee: 2500 },
  { id: '3', clientName: 'Amit Kumar', scheduledAt: '2026-05-18 10:00 AM', mode: 'AUDIO', status: 'CONFIRMED', issue: 'Business contract review', fee: 2500 },
  { id: '4', clientName: 'Neha Verma', scheduledAt: '2026-05-12 2:00 PM', mode: 'VIDEO', status: 'COMPLETED', issue: 'Divorce proceedings', fee: 2500 },
];

const statusColor: Record<string, string> = {
  CONFIRMED: 'bg-emerald-100 text-emerald-700', PENDING: 'bg-yellow-100 text-yellow-700', COMPLETED: 'bg-slate-100 text-slate-600',
};

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your client appointments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Today', value: 1, color: 'bg-indigo-50 text-indigo-600' },
          { label: 'This Week', value: 3, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Pending Confirm', value: 1, color: 'bg-yellow-50 text-yellow-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-3xl font-bold text-slate-900">{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">All Appointments</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {appointments.map((apt) => (
            <div key={apt.id} className="flex items-center gap-4 px-6 py-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                {apt.clientName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 text-sm">{apt.clientName}</p>
                <p className="text-xs text-slate-400 mt-0.5">{apt.issue}</p>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                  <Clock className="h-3 w-3" />{apt.scheduledAt}
                  {apt.mode === 'VIDEO' ? <Video className="h-3 w-3 ml-1" /> : <Phone className="h-3 w-3 ml-1" />}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[apt.status]}`}>{apt.status}</span>
                {apt.status === 'PENDING' && (
                  <div className="flex gap-1.5">
                    <Button size="sm" className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700">Accept</Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs">Decline</Button>
                  </div>
                )}
                {apt.status === 'CONFIRMED' && (
                  <Button size="sm" className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700">Join</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
