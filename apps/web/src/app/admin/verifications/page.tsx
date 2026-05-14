'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Loader2, ExternalLink } from 'lucide-react';

const initPending = [
  { id: '1', lawyerProfileId: 'lp1', name: 'Adv. Kavya Reddy', email: 'kavya@example.com', practiceArea: 'Family Law', barCouncil: 'KA/12345/2018', submittedAt: '2026-05-06', experience: '8 yrs' },
  { id: '2', lawyerProfileId: 'lp2', name: 'Adv. Sanjay Patel', email: 'sanjay@example.com', practiceArea: 'Corporate Law', barCouncil: 'MH/98765/2015', submittedAt: '2026-05-05', experience: '11 yrs' },
  { id: '3', lawyerProfileId: 'lp3', name: 'Adv. Meena Iyer', email: 'meena@example.com', practiceArea: 'Immigration Law', barCouncil: 'TN/45678/2020', submittedAt: '2026-05-04', experience: '6 yrs' },
];

const initApproved = [
  { id: '4', name: 'Adv. Rahul Sharma', email: 'adv.rahul@example.com', practiceArea: 'Property Law', barCouncil: 'DL/12345/2012', approvedAt: '2026-04-20' },
];

type PendingLawyer = typeof initPending[0];
type ApprovedLawyer = typeof initApproved[0];

export default function VerificationsPage() {
  const [pending, setPending] = useState<PendingLawyer[]>(initPending);
  const [approved, setApproved] = useState<ApprovedLawyer[]>(initApproved);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  async function handleVerdict(lawyer: PendingLawyer, verdict: 'VERIFIED' | 'REJECTED') {
    setLoading(l => ({ ...l, [lawyer.id]: true }));
    try {
      const res = await fetch(`/api/admin/verifications/${lawyer.lawyerProfileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: verdict }),
      });

      if (!res.ok) throw new Error('Failed');

      // Move from pending to approved (or just remove if rejected)
      setPending(p => p.filter(l => l.id !== lawyer.id));
      if (verdict === 'VERIFIED') {
        setApproved(a => [{
          id: lawyer.id,
          name: lawyer.name,
          email: lawyer.email,
          practiceArea: lawyer.practiceArea,
          barCouncil: lawyer.barCouncil,
          approvedAt: new Date().toISOString().split('T')[0],
        }, ...a]);
      }
    } catch {
      alert('Action failed. Please try again.');
    } finally {
      setLoading(l => ({ ...l, [lawyer.id]: false }));
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lawyer Verifications</h1>
        <p className="text-slate-500 text-sm mt-0.5">Review and approve lawyer credentials</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending Review', value: pending.length, color: 'text-amber-600' },
          { label: 'Approved This Month', value: approved.length, color: 'text-emerald-600' },
          { label: 'Total Verified', value: 523 + approved.length, color: 'text-indigo-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-amber-500" />
          Pending Approval ({pending.length})
        </h2>

        {pending.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center text-slate-400 text-sm">
            No pending verifications — you&apos;re all caught up!
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {pending.map(l => (
                <div key={l.id} className="flex items-center gap-4 px-6 py-5">
                  <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-sm font-bold shrink-0">
                    {l.name.split(' ').map(n => n[0]).join('').slice(1, 3)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 text-sm">{l.name}</p>
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Pending</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{l.email} · {l.practiceArea} · {l.experience}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Bar Council: <span className="font-medium text-slate-700">{l.barCouncil}</span> · Submitted {l.submittedAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
                      <ExternalLink className="h-3 w-3" />View
                    </Button>
                    <Button
                      size="sm"
                      disabled={loading[l.id]}
                      onClick={() => handleVerdict(l, 'VERIFIED')}
                      className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 gap-1.5"
                    >
                      {loading[l.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={loading[l.id]}
                      onClick={() => handleVerdict(l, 'REJECTED')}
                      className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Approved */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          Recently Approved ({approved.length})
        </h2>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {approved.map(l => (
              <div key={l.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0">
                  {l.name.split(' ').map(n => n[0]).join('').slice(1, 3)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm">{l.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{l.email} · {l.practiceArea} · Bar: {l.barCouncil}</p>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
                  Approved {l.approvedAt}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
