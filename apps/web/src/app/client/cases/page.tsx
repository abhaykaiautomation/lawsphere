import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, ArrowRight, Search } from 'lucide-react';

const cases = [
  { id: '1', title: 'Property Dispute with Neighbour', status: 'MATCHED', urgency: 'HIGH', practiceArea: 'Property Law', createdAt: '2026-05-01', lawyer: 'Adv. Rahul Sharma' },
  { id: '2', title: 'Employee Termination Dispute', status: 'IN_CONSULTATION', urgency: 'MEDIUM', practiceArea: 'Employment Law', createdAt: '2026-04-28', lawyer: 'Adv. Priya Nair' },
  { id: '3', title: 'Business Contract Review', status: 'PENDING', urgency: 'LOW', practiceArea: 'Corporate Law', createdAt: '2026-04-20', lawyer: null },
  { id: '4', title: 'Divorce Proceedings', status: 'RESOLVED', urgency: 'HIGH', practiceArea: 'Family Law', createdAt: '2026-03-10', lawyer: 'Adv. Sanjay Patel' },
];

const urgencyColor: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700', MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-green-100 text-green-700', CRITICAL: 'bg-red-200 text-red-800',
};
const statusColor: Record<string, string> = {
  MATCHED: 'bg-indigo-100 text-indigo-700', IN_CONSULTATION: 'bg-emerald-100 text-emerald-700',
  PENDING: 'bg-slate-100 text-slate-600', RESOLVED: 'bg-green-100 text-green-700',
};

export default function CasesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Cases</h1>
          <p className="text-slate-500 text-sm mt-0.5">All your legal cases in one place</p>
        </div>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Link href="/client/intake"><PlusCircle className="h-4 w-4" />New Case</Link>
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Search cases..." />
        </div>
      </div>

      {/* Cases list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <p className="text-sm text-slate-500 font-medium">{cases.length} cases total</p>
        </div>
        <div className="divide-y divide-slate-100">
          {cases.map((c) => (
            <Link key={c.id} href={`/client/cases/${c.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-indigo-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 text-sm">{c.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{c.practiceArea} · {c.createdAt}{c.lawyer ? ` · ${c.lawyer}` : ''}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${urgencyColor[c.urgency]}`}>{c.urgency}</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[c.status] ?? 'bg-slate-100 text-slate-600'}`}>{c.status.replace('_', ' ')}</span>
                <ArrowRight className="h-4 w-4 text-slate-300" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
