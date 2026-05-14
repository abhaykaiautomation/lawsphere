'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { SignInPrompt } from '@/components/layouts/sign-in-prompt';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Brain, Loader2, ArrowRight, CheckCircle2,
  Scale, AlertTriangle, FileText, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const schema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200),
  description: z.string().min(50, `Please describe your issue in at least 50 characters so our AI can accurately classify it`),
  desiredOutcome: z.string().optional(),
  preferredLocation: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const AI_STEPS = [
  { icon: Brain,         label: 'Classifying legal category',       key: 'classify' },
  { icon: AlertTriangle, label: 'Detecting urgency & risk factors',  key: 'urgency'  },
  { icon: FileText,      label: 'Summarising your issue',           key: 'summary'  },
  { icon: Scale,         label: 'Matching top lawyers for your case', key: 'match'   },
];

interface Case {
  id: string;
  caseNumber: string;
  status: string;
  urgency: string;
  aiClassification: string | null;
  aiSummary: string | null;
}

// Wrapper handles auth check — keeps all hooks inside IntakeForm unconditional
export default function IntakePage() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <SignInPrompt message="Sign in to submit a legal issue" />;
  return <IntakeForm />;
}

function IntakeForm() {
  const token   = useAuthStore((s) => s.token);

  const router  = useRouter();
  const [step, setStep]       = useState<0 | 1 | 2>(0);
  const [aiStep, setAiStep]   = useState(0);       // which AI step is "active"
  const [doneSteps, setDoneSteps] = useState<number[]>([]);
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]     = useState('');
  const pollRef               = useRef<ReturnType<typeof setInterval> | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const descLen = watch('description', '').length;

  // Animate AI steps while polling
  useEffect(() => {
    if (step !== 1) return;
    let current = 0;
    const interval = setInterval(() => {
      if (current < AI_STEPS.length - 1) {
        setDoneSteps(d => [...d, current]);
        current++;
        setAiStep(current);
      }
    }, 2200);
    return () => clearInterval(interval);
  }, [step]);

  // Poll for case completion
  function startPolling(caseId: string) {
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/intake/cases/${caseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const { data }: { data: Case } = await res.json();
        if (data.status !== 'DRAFT') {
          clearInterval(pollRef.current!);
          setCaseData(data);
          setDoneSteps([0, 1, 2, 3]);
          setTimeout(() => setStep(2), 800);
        }
      } catch { /* keep polling */ }
      if (attempts >= 20) { // 40s max
        clearInterval(pollRef.current!);
        setStep(2);
      }
    }, 2000);
  }

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/intake/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'Failed to submit');
      }
      const { data: newCase }: { data: Case } = await res.json();
      setCaseData(newCase);
      setStep(1);
      startPolling(newCase.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Step 0: Form ────────────────────────────────────────────────────────────
  if (step === 0) return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Describe Your Legal Issue</h1>
        <p className="text-slate-500 text-sm mt-1">Our AI analyses your issue, classifies the legal area, and matches you with the best lawyers — in seconds.</p>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        {['Issue Details', 'AI Analysis', 'Lawyer Matches'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${i === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {i + 1}
            </div>
            <span className={`text-sm ${i === 0 ? 'font-medium text-slate-900' : 'text-slate-400'}`}>{label}</span>
            {i < 2 && <div className="h-px w-8 bg-slate-200" />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Brief Title *</label>
            <input
              placeholder="e.g. Landlord refusing to return security deposit"
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              {...register('title')}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Detailed Description *
              <span className="ml-2 text-slate-400 font-normal">
                ({descLen} chars {descLen < 50 ? `— ${50 - descLen} more needed` : '✓'})
              </span>
            </label>
            <textarea
              rows={6}
              placeholder="Describe your legal situation in detail. Include: what happened, when, who is involved, what documents you have, and what outcome you want..."
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
              {...register('description')}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Desired Outcome</label>
              <input
                placeholder="e.g. Recover deposit, get compensation"
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                {...register('desiredOutcome')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Preferred City</label>
              <input
                placeholder="e.g. Bangalore, Mumbai, Delhi"
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                {...register('preferredLocation')}
              />
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
            <Sparkles className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
            <p className="text-sm text-indigo-700">Our AI will classify your issue, score urgency, and find the 5 best-matched verified lawyers — all in under 30 seconds.</p>
          </div>

          {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base font-semibold"
            size="lg"
          >
            {submitting
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
              : <>Submit &amp; Get Lawyer Matches <ArrowRight className="ml-2 h-4 w-4" /></>}
          </Button>
        </form>
      </div>
    </div>
  );

  // ─── Step 1: AI Processing ────────────────────────────────────────────────────
  if (step === 1) return (
    <div className="max-w-lg mx-auto mt-8">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="h-1.5 bg-slate-100">
          <div
            className="h-full bg-indigo-600 transition-all duration-700"
            style={{ width: `${((doneSteps.length + 1) / AI_STEPS.length) * 100}%` }}
          />
        </div>
        <div className="p-10 text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center">
              <Brain className="h-10 w-10 text-white" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-indigo-600 animate-ping opacity-20" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">AI Analysing Your Issue</h2>
          <p className="text-sm text-slate-500 mb-8">This usually takes 10–20 seconds</p>

          <div className="space-y-3 text-left">
            {AI_STEPS.map((s, i) => {
              const isDone    = doneSteps.includes(i);
              const isActive  = aiStep === i && !isDone;
              return (
                <div key={s.key} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isDone ? 'bg-emerald-50' : isActive ? 'bg-indigo-50' : 'bg-slate-50'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isDone ? 'bg-emerald-100' : isActive ? 'bg-indigo-100' : 'bg-slate-200'}`}>
                    {isDone
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      : isActive
                        ? <Loader2 className="h-4 w-4 text-indigo-600 animate-spin" />
                        : <s.icon className="h-4 w-4 text-slate-400" />}
                  </div>
                  <span className={`text-sm font-medium ${isDone ? 'text-emerald-700' : isActive ? 'text-indigo-700' : 'text-slate-400'}`}>
                    {s.label}
                  </span>
                  {isDone && <span className="ml-auto text-xs text-emerald-600 font-medium">Done</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Step 2: Complete ────────────────────────────────────────────────────────
  const urgencyColor: Record<string, string> = {
    CRITICAL: 'bg-red-100 text-red-700', HIGH: 'bg-orange-100 text-orange-700',
    MEDIUM: 'bg-yellow-100 text-yellow-700', LOW: 'bg-green-100 text-green-700',
  };

  return (
    <div className="max-w-lg mx-auto mt-8">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Analysis Complete!</h2>
        <p className="text-slate-500 text-sm mb-6">
          Case <span className="font-semibold text-slate-900">{caseData?.caseNumber}</span> has been analysed and lawyer matches are ready.
        </p>

        {caseData && (
          <div className="bg-slate-50 rounded-2xl p-5 text-left mb-6 space-y-3">
            {caseData.aiClassification && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Legal Area</span>
                <span className="font-medium text-slate-900 capitalize">{caseData.aiClassification.replace(/-/g, ' ')}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Urgency</span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${urgencyColor[caseData.urgency] ?? ''}`}>{caseData.urgency}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Status</span>
              <span className="font-medium text-indigo-700">{caseData.status.replace('_', ' ')}</span>
            </div>
            {caseData.aiSummary && (
              <div className="pt-2 border-t border-slate-200 text-xs text-slate-500 leading-relaxed">{caseData.aiSummary}</div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => router.push(`/client/cases/${caseData?.id}`)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 font-semibold"
          >
            View Lawyer Matches <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => { setStep(0); setDoneSteps([]); setAiStep(0); setCaseData(null); }}
            className="w-full h-11"
          >
            Submit Another Issue
          </Button>
        </div>
      </div>
    </div>
  );
}
