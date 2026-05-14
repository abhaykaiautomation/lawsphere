'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Loader2, ExternalLink, RefreshCw } from 'lucide-react';

interface PendingLawyer {
  id: string;
  firstName: string;
  lastName: string;
  barCouncilNumber: string | null;
  city: string | null;
  yearsOfExperience: number;
  createdAt: string;
  user: { email: string };
  practiceAreas: { practiceArea: { name: string } }[];
}

interface ApprovedLawyer {
  id: string;
  name: string;
  email: string;
  practiceArea: string;
  barCouncil: string;
  approvedAt: string;
}

export default function VerificationsPage() {
  const token = useAuthStore((s) => s.token);
  const [pending, setPending] = useState<PendingLawyer[]>([]);
  const [approved, setApproved] = useState<ApprovedLawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  async function fetchPending() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/verifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const { data } = await res.json();
      setPending(data.lawyers ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (token) fetchPending(); }, [token]);

  async function handleVerdict(lawyer: PendingLawyer, verdict: 'VERIFIED' | 'REJECTED') {
    setActionLoading(l => ({ ...l, [lawyer.id]: true }));
    try {
      const res = await fetch(`/api/admin/verifications/${lawyer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: verdict }),
      });
      if (!res.ok) throw new Error('Failed');

      setPending(p => p.filter(l => l.id !== lawyer.id));
      if (verdict === 'VERIFIED') {
        setApproved(a => [{
          id: lawyer.id,
          name: `Adv. ${lawyer.firstName} ${lawyer.lastName}`,
          email: lawyer.user.email,
          practiceArea: lawyer.practiceAreas[0]?.practiceArea.name ?? 'General',
          barCouncil: lawyer.barCouncilNumber ?? '—',
          approvedAt: new Date().toISOString().split('T')[0],
        }, ...a]);
      }
    } catch {
      alert('Action failed. Please try again.');
    } finally {
      setActionLoading(l => ({ ...l, [lawyer.id]: false }));
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lawyer Verifications</h1>
          <p className="text-slate-500 text-sm mt-0.5">Review and approve lawyer credentials</p>
        </div>
        <Button variant="outline" onClick={fetchPending} className="gap-2 h-9 text-sm">
          <RefreshCw className="h-3.5 w-3.5" />Refresh
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending Review', value: pending.length, color: 'text-amber-600' },
          { label: 'Approved This Session', value: approved.length, color: 'text-emerald-600' },
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
          <ShieldCheck className="h-4 w-4 text-amber-500" />Pending Approval ({pending.length})
        </h2>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-slate-400 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />Loading...
            </div>
          ) : pending.length === 0 ? (
            <div className="py-14 text-center text-slate-400 text-sm">No pending verifications — all caught up!</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pending.map(l => (
                <div key={l.id} className="flex items-center gap-4 px-6 py-5">
                  <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-sm font-bold shrink-0">
                    {l.firstName[0]}{l.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 text-sm">Adv. {l.firstName} {l.lastName}</p>
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Pending</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{l.user.email} · {l.practiceAreas[0]?.practiceArea.name ?? 'General'} · {l.yearsOfExperience} yrs</p>
                    {l.barCouncilNumber && (
                      <p className="text-xs text-slate-400 mt-0.5">Bar Council: <span className="font-medium text-slate-700">{l.barCouncilNumber}</span> · {l.city ?? '—'}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
                      <ExternalLink className="h-3 w-3" />View
                    </Button>
                    <Button size="sm" disabled={actionLoading[l.id]} onClick={() => handleVerdict(l, 'VERIFIED')} className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 gap-1.5">
                      {actionLoading[l.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : null}Approve
                    </Button>
                    <Button size="sm" variant="outline" disabled={actionLoading[l.id]} onClick={() => handleVerdict(l, 'REJECTED')} className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50">
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Approved this session */}
      {approved.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />Approved This Session ({approved.length})
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
      )}
    </div>
  );
}
