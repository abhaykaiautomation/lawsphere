'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Loader2, ExternalLink, RefreshCw, Copy, CheckCircle2, X } from 'lucide-react';

interface PendingLawyer {
  id: string; firstName: string; lastName: string;
  barCouncilNumber: string | null; barCouncilState: string | null;
  city: string | null; yearsOfExperience: number; createdAt: string;
  user: { email: string; phone: string | null };
  practiceAreas: { practiceArea: { name: string } }[];
}

interface Credentials {
  email: string; tempPassword: string; loginUrl: string; lawyerName: string;
}

export default function VerificationsPage() {
  const token = useAuthStore((s) => s.token);
  const [pending,  setPending]  = useState<PendingLawyer[]>([]);
  const [approved, setApproved] = useState<{ id: string; name: string; email: string; approvedAt: string }[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [creds,    setCreds]    = useState<Credentials | null>(null);
  const [copied,   setCopied]   = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function fetchPending() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/verifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const { data } = await res.json();
      setPending(data.lawyers ?? []);
    } finally { setLoading(false); }
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
      const { data } = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Failed');

      setPending(p => p.filter(l => l.id !== lawyer.id));

      if (verdict === 'VERIFIED' && data.credentials) {
        setCreds({ ...data.credentials, lawyerName: `Adv. ${lawyer.firstName} ${lawyer.lastName}` });
        setApproved(a => [{ id: lawyer.id, name: `Adv. ${lawyer.firstName} ${lawyer.lastName}`, email: lawyer.user.email, approvedAt: new Date().toISOString().split('T')[0] }, ...a]);
      }
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Action failed');
    } finally { setActionLoading(l => ({ ...l, [lawyer.id]: false })); }
  }

  function copyCredentials() {
    if (!creds) return;
    navigator.clipboard.writeText(`Email: ${creds.email}\nPassword: ${creds.tempPassword}\nLogin: ${creds.loginUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-8">
      {/* Credentials Modal */}
      {creds && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Account Created ✓</h2>
                <p className="text-sm text-slate-500 mt-0.5">{creds.lawyerName}</p>
              </div>
              <button onClick={() => setCreds(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Email</span>
                <span className="font-semibold text-slate-900">{creds.email}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Temp Password</span>
                <span className="font-mono font-bold text-lg text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">{creds.tempPassword}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Login URL</span>
                <span className="text-indigo-600 text-xs">{creds.loginUrl}</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 mb-5">
              ⚠ Share these credentials with the lawyer. They should change their password after first login.
            </div>

            <div className="flex gap-3">
              <Button onClick={copyCredentials} variant="outline" className="flex-1 gap-2">
                {copied ? <><CheckCircle2 className="h-4 w-4 text-emerald-500" />Copied!</> : <><Copy className="h-4 w-4" />Copy Credentials</>}
              </Button>
              <Button onClick={() => setCreds(null)} className="flex-1 bg-indigo-600 hover:bg-indigo-700">Done</Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lawyer Verifications</h1>
          <p className="text-slate-500 text-sm mt-0.5">Review applications and create Firebase accounts</p>
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
          <ShieldCheck className="h-4 w-4 text-amber-500" />Pending Applications ({pending.length})
        </h2>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-slate-400 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />Loading applications...
            </div>
          ) : pending.length === 0 ? (
            <div className="py-14 text-center text-slate-400 text-sm">No pending applications — all caught up!</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pending.map(l => (
                <div key={l.id}>
                  <div className="flex items-center gap-4 px-6 py-5">
                    <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-sm font-bold shrink-0">
                      {l.firstName[0]}{l.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 text-sm">Adv. {l.firstName} {l.lastName}</p>
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Pending</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{l.user.email} · {l.practiceAreas.map(a => a.practiceArea.name).join(', ')}</p>
                      {l.barCouncilNumber && (
                        <p className="text-xs text-slate-400 mt-0.5">Bar: <span className="font-medium text-slate-700">{l.barCouncilNumber}</span>{l.barCouncilState ? ` · ${l.barCouncilState}` : ''} · {l.city} · {l.yearsOfExperience} yrs exp.</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => setExpanded(expanded === l.id ? null : l.id)} className="h-8 text-xs gap-1.5">
                        <ExternalLink className="h-3 w-3" />{expanded === l.id ? 'Collapse' : 'Review'}
                      </Button>
                      <Button size="sm" disabled={actionLoading[l.id]} onClick={() => handleVerdict(l, 'VERIFIED')} className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 gap-1.5">
                        {actionLoading[l.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : null}Approve
                      </Button>
                      <Button size="sm" variant="outline" disabled={actionLoading[l.id]} onClick={() => handleVerdict(l, 'REJECTED')} className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50">
                        Reject
                      </Button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {expanded === l.id && (
                    <div className="px-6 pb-5 bg-slate-50 border-t border-slate-100">
                      <div className="grid md:grid-cols-3 gap-4 mt-4 text-sm">
                        {[
                          { label: 'Email', value: l.user.email },
                          { label: 'Phone', value: l.user.phone ?? '—' },
                          { label: 'City', value: l.city ?? '—' },
                          { label: 'Experience', value: `${l.yearsOfExperience} years` },
                          { label: 'Bar Council No.', value: l.barCouncilNumber ?? '—' },
                          { label: 'Bar Council', value: l.barCouncilState ?? '—' },
                        ].map(d => (
                          <div key={d.label}>
                            <p className="text-xs text-slate-400">{d.label}</p>
                            <p className="font-medium text-slate-900 mt-0.5">{d.value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3">
                        <p className="text-xs text-slate-400 mb-1">Practice Areas</p>
                        <div className="flex flex-wrap gap-1.5">
                          {l.practiceAreas.map(a => (
                            <span key={a.practiceArea.name} className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">{a.practiceArea.name}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Approved */}
      {approved.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />Approved This Session
          </h2>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {approved.map(l => (
                <div key={l.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0">
                    {l.name.split(' ').map(n => n[0]).join('').slice(1, 3)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 text-sm">{l.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{l.email}</p>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">Firebase account created</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
