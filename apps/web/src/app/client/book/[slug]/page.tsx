'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { SignInPrompt } from '@/components/layouts/sign-in-prompt';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Video, Phone, Calendar, Clock, Loader2, CheckCircle2 } from 'lucide-react';

interface LawyerInfo {
  id: string; firstName: string; lastName: string;
  slug: string; city: string | null; consultationFee: number;
  yearsOfExperience: number; averageRating: number;
  practiceAreas: { practiceArea: { name: string }; isPrimary: boolean }[];
}

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00',
];

function addDays(date: Date, days: number) {
  const d = new Date(date); d.setDate(d.getDate() + days); return d;
}

function formatDate(d: Date) {
  return d.toISOString().split('T')[0];
}

function displayDate(d: Date) {
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function BookPage() {
  const params  = useParams();
  const slug    = params.slug as string;
  const router  = useRouter();
  const user    = useAuthStore((s) => s.user);
  const token   = useAuthStore((s) => s.token);

  const [lawyer,    setLawyer]    = useState<LawyerInfo | null>(null);
  const [loadingL,  setLoadingL]  = useState(true);

  const today       = new Date();
  const dateOptions = [1, 2, 3, 4, 5, 7, 8].map(n => addDays(today, n));

  const [selectedDate, setSelectedDate] = useState(formatDate(dateOptions[0]));
  const [selectedTime, setSelectedTime] = useState('');
  const [mode,         setMode]         = useState<'VIDEO' | 'AUDIO'>('VIDEO');
  const [duration,     setDuration]     = useState(30);
  const [notes,        setNotes]        = useState('');
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState('');

  useEffect(() => {
    fetch(`/api/lawyers/${slug}`)
      .then(r => r.json())
      .then(({ data }) => setLawyer(data))
      .catch(() => setLawyer(null))
      .finally(() => setLoadingL(false));
  }, [slug]);

  if (!user) return <SignInPrompt message="Sign in to book a consultation" />;

  if (loadingL) return (
    <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
      <Loader2 className="h-5 w-5 animate-spin" />Loading…
    </div>
  );

  if (!lawyer) return (
    <div className="text-center py-20 text-slate-400">
      <p>Lawyer not found.</p>
      <Link href="/lawyers" className="text-indigo-600 hover:underline mt-2 inline-block">Browse lawyers</Link>
    </div>
  );

  const fee       = Number(lawyer.consultationFee);
  const platform  = Math.round(fee * 0.1);
  const total     = fee + platform;

  async function handleBook() {
    if (!selectedTime) { setError('Please select a time slot'); return; }
    setSubmitting(true); setError('');
    try {
      const scheduledAt = new Date(`${selectedDate}T${selectedTime}:00`);
      const res = await fetch('/api/consultations/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          lawyerProfileId: lawyer.id,
          scheduledAt: scheduledAt.toISOString(),
          durationMin: duration,
          mode,
          clientNotes: notes || undefined,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message ?? 'Booking failed');
      router.push(`/client/consultations/${body.data.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Booking failed');
    } finally { setSubmitting(false); }
  }

  const primaryArea = lawyer.practiceAreas.find(a => a.isPrimary)?.practiceArea.name
    ?? lawyer.practiceAreas[0]?.practiceArea.name ?? 'General Practice';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/lawyers/${slug}`} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Book Consultation</h1>
          <p className="text-slate-500 text-sm mt-0.5">with Adv. {lawyer.firstName} {lawyer.lastName}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Booking form */}
        <div className="lg:col-span-2 space-y-5">

          {/* Mode */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Consultation Mode</h2>
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: 'VIDEO', icon: Video, label: 'Video Call', desc: 'Face-to-face via HD video' },
                { value: 'AUDIO', icon: Phone, label: 'Audio Call',  desc: 'Voice call only' },
              ] as const).map(m => (
                <button key={m.value} onClick={() => setMode(m.value)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${mode === m.value ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${mode === m.value ? 'bg-indigo-600' : 'bg-slate-100'}`}>
                    <m.icon className={`h-5 w-5 ${mode === m.value ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${mode === m.value ? 'text-indigo-700' : 'text-slate-700'}`}>{m.label}</p>
                    <p className="text-xs text-slate-400">{m.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Duration</h2>
            <div className="flex gap-3">
              {[30, 45, 60].map(d => (
                <button key={d} onClick={() => setDuration(d)}
                  className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${duration === d ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-indigo-300 text-slate-600'}`}>
                  {d} min
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-slate-400" />Select Date
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {dateOptions.map(d => {
                const val = formatDate(d);
                return (
                  <button key={val} onClick={() => setSelectedDate(val)}
                    className={`py-3 rounded-xl border-2 text-center text-xs font-medium transition-all ${selectedDate === val ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-indigo-300 text-slate-600'}`}>
                    {displayDate(d)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-400" />Select Time
            </h2>
            <div className="grid grid-cols-5 gap-2">
              {TIME_SLOTS.map(t => (
                <button key={t} onClick={() => setSelectedTime(t)}
                  className={`py-2.5 rounded-xl border-2 text-xs font-medium transition-all ${selectedTime === t ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 hover:border-indigo-300 text-slate-600'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-900 mb-2">Notes for Lawyer <span className="text-slate-400 font-normal text-sm">(optional)</span></h2>
            <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Briefly describe your issue or any specific questions you want to address..."
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" />
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sticky top-6">
            {/* Lawyer info */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                {lawyer.firstName[0]}{lawyer.lastName[0]}
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Adv. {lawyer.firstName} {lawyer.lastName}</p>
                <p className="text-xs text-slate-400">{primaryArea} · {lawyer.yearsOfExperience} yrs</p>
                {Number(lawyer.averageRating) > 0 && (
                  <p className="text-xs text-amber-600">★ {Number(lawyer.averageRating).toFixed(1)}</p>
                )}
              </div>
            </div>

            {/* Booking summary */}
            <div className="space-y-2.5 text-sm mb-5">
              <div className="flex justify-between">
                <span className="text-slate-500">Date</span>
                <span className="font-medium text-slate-900">
                  {selectedDate ? new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Time</span>
                <span className="font-medium text-slate-900">{selectedTime || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration</span>
                <span className="font-medium text-slate-900">{duration} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mode</span>
                <span className="font-medium text-slate-900">{mode === 'VIDEO' ? '📹 Video' : '📞 Audio'}</span>
              </div>
            </div>

            {/* Fee */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm mb-5">
              <div className="flex justify-between text-slate-600">
                <span>Consultation</span><span>₹{fee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-xs">
                <span>Platform fee (10%)</span><span>₹{platform.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-2">
                <span>Total</span><span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {error && <p className="text-red-500 text-xs mb-3 text-center">{error}</p>}

            <Button onClick={handleBook} disabled={submitting || !selectedTime}
              className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 font-semibold gap-2">
              {submitting
                ? <><Loader2 className="h-4 w-4 animate-spin" />Booking…</>
                : <><CheckCircle2 className="h-4 w-4" />Confirm Booking</>}
            </Button>
            <p className="text-xs text-slate-400 text-center mt-2 leading-relaxed">Payment collected after lawyer confirms</p>
          </div>
        </div>
      </div>
    </div>
  );
}
