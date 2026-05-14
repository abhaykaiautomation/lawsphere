import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Brain, Calendar, User, AlertCircle } from 'lucide-react';

export default function CaseDetailPage({ params }: { params: { id: string } }) {
  const mockCase = {
    id: params.id,
    title: 'Property Dispute with Neighbour',
    status: 'MATCHED',
    urgency: 'HIGH',
    practiceArea: 'Property Law',
    createdAt: '2026-05-01',
    description: 'My neighbour has illegally encroached on my property by building a wall that extends 2 feet into my land. I have the original property documents and survey reports showing the boundary clearly.',
    aiSummary: 'This is a civil property encroachment dispute. The client has documentary evidence (property documents + survey report) supporting their claim. Recommend filing a suit for mandatory injunction and possession.',
    urgencyReason: 'Ongoing construction by neighbour may cause irreversible damage if not stopped quickly.',
    entities: ['Property encroachment', 'Boundary dispute', 'Injunction'],
    recommendations: [
      { id: '1', name: 'Adv. Rahul Sharma', score: 94, experience: '12 yrs', area: 'Property Law', fee: 2500, rating: 4.9 },
      { id: '2', name: 'Adv. Sunita Kapoor', score: 88, experience: '8 yrs', area: 'Property Law', fee: 2000, rating: 4.7 },
      { id: '3', name: 'Adv. Vikram Mehta', score: 82, experience: '15 yrs', area: 'Civil Law', fee: 3000, rating: 4.8 },
    ],
  };

  const urgencyColor: Record<string, string> = { HIGH: 'bg-red-100 text-red-700', MEDIUM: 'bg-yellow-100 text-yellow-700', LOW: 'bg-green-100 text-green-700' };
  const statusColor: Record<string, string> = { MATCHED: 'bg-indigo-100 text-indigo-700', IN_CONSULTATION: 'bg-emerald-100 text-emerald-700', PENDING: 'bg-slate-100 text-slate-600' };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/client/cases" className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{mockCase.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${urgencyColor[mockCase.urgency]}`}>{mockCase.urgency}</span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[mockCase.status]}`}>{mockCase.status}</span>
            <span className="text-xs text-slate-400">{mockCase.practiceArea} · {mockCase.createdAt}</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Description */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-slate-400" />
              <h2 className="font-semibold text-slate-900">Case Description</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{mockCase.description}</p>
          </div>

          {/* AI Analysis */}
          <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <h2 className="font-semibold text-slate-900">AI Analysis</h2>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Powered by GPT-4o</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">{mockCase.aiSummary}</p>
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{mockCase.urgencyReason}</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {mockCase.entities.map((e) => (
                <span key={e} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{e}</span>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Recommended Lawyers</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {mockCase.recommendations.map((r, i) => (
                <div key={r.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                    {r.name.split(' ').map(n => n[0]).join('').slice(1, 3)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm">{r.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{r.area} · {r.experience} · ★ {r.rating}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {i === 0 && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Best Match</span>}
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Match</p>
                      <p className="text-sm font-bold text-indigo-600">{r.score}%</p>
                    </div>
                    <Button size="sm" asChild className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs">
                      <Link href={`/lawyers/${r.id}`}>Book ₹{r.fee.toLocaleString('en-IN')}</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="font-semibold text-slate-900 text-sm mb-4">Case Details</h2>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Case ID', value: `#${mockCase.id}` },
                { label: 'Practice Area', value: mockCase.practiceArea },
                { label: 'Status', value: mockCase.status },
                { label: 'Urgency', value: mockCase.urgency },
                { label: 'Filed On', value: mockCase.createdAt },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-slate-400">{label}</span>
                  <span className="font-medium text-slate-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-2">
            <h2 className="font-semibold text-slate-900 text-sm mb-3">Actions</h2>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 justify-start gap-2" asChild>
              <Link href="/client/consultations"><Calendar className="h-4 w-4" />Schedule Consultation</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" asChild>
              <Link href="/client/documents"><FileText className="h-4 w-4" />Upload Documents</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" asChild>
              <Link href="/client/messages"><User className="h-4 w-4" />Message Lawyer</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
