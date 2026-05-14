'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import { Clock, CheckCircle, Mail, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  { icon: CheckCircle, label: 'Account created', done: true },
  { icon: FileText, label: 'Profile under review', done: true },
  { icon: Clock, label: 'Admin approval', done: false },
  { icon: Mail, label: 'Email confirmation sent', done: false },
];

export default function LawyerPendingPage() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Top accent */}
          <div className="h-2 bg-gradient-to-r from-emerald-500 to-emerald-400" />

          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-5">
              <Clock className="h-8 w-8 text-amber-600" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-2">Application Under Review</h1>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
              Your lawyer account is pending admin approval. We typically review applications within <strong>24–48 hours</strong>.
            </p>

            {user?.email && (
              <div className="mt-4 inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 text-sm text-slate-600">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                {user.email}
              </div>
            )}
          </div>

          {/* Progress steps */}
          <div className="px-8 pb-6">
            <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${step.done ? 'bg-emerald-100' : 'bg-slate-200'}`}>
                    <step.icon className={`h-3.5 w-3.5 ${step.done ? 'text-emerald-600' : 'text-slate-400'}`} />
                  </div>
                  <span className={`text-sm font-medium ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                  {step.done && <span className="ml-auto text-xs text-emerald-600 font-medium">Done</span>}
                  {!step.done && i === 2 && <span className="ml-auto text-xs text-amber-600 font-medium">Pending</span>}
                </div>
              ))}
            </div>
          </div>

          {/* What to do while waiting */}
          <div className="px-8 pb-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">While you wait</p>
            <div className="space-y-2">
              {[
                { href: '/lawyer/profile', label: 'Complete your profile to speed up approval', icon: FileText },
                { href: '/lawyers', label: 'See how other lawyers present themselves', icon: ArrowRight },
              ].map((item) => (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all text-sm text-slate-700">
                  <item.icon className="h-4 w-4 text-emerald-500 shrink-0" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 pb-8 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => { clearAuth(); window.location.href = '/'; }}>
              Sign Out
            </Button>
            <Button asChild className="flex-1 bg-emerald-600 hover:bg-emerald-700">
              <Link href="/lawyer/profile">Complete Profile</Link>
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Questions? Contact <a href="mailto:support@lawsphere.in" className="text-indigo-600 hover:underline">support@lawsphere.in</a>
        </p>
      </div>
    </div>
  );
}
