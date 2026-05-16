'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Scale, CheckCircle2, Loader2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PRACTICE_AREAS = [
  { slug: 'family-law',          name: 'Family Law' },
  { slug: 'criminal-law',        name: 'Criminal Law' },
  { slug: 'corporate-law',       name: 'Corporate Law' },
  { slug: 'property-law',        name: 'Property Law' },
  { slug: 'employment-law',      name: 'Employment Law' },
  { slug: 'immigration-law',     name: 'Immigration Law' },
  { slug: 'intellectual-property', name: 'Intellectual Property' },
  { slug: 'tax-law',             name: 'Tax Law' },
  { slug: 'civil-litigation',    name: 'Civil Litigation' },
  { slug: 'consumer-law',        name: 'Consumer Law' },
  { slug: 'banking-finance',     name: 'Banking & Finance' },
  { slug: 'medical-law',         name: 'Medical Law' },
];

const BAR_COUNCILS = [
  'Bar Council of Delhi', 'Bar Council of Maharashtra & Goa',
  'Bar Council of Karnataka', 'Bar Council of Tamil Nadu',
  'Bar Council of Telangana', 'Bar Council of Gujarat',
  'Bar Council of West Bengal', 'Bar Council of Rajasthan',
  'Bar Council of Uttar Pradesh', 'Bar Council of Kerala',
  'Bar Council of Punjab & Haryana', 'Bar Council of India',
];

export default function LawyerApplyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    barCouncilNumber: '', barCouncilState: '',
    yearsOfExperience: '', city: '', state: '',
    bio: '', headline: '',
  });

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function toggleArea(slug: string) {
    setSelectedAreas(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedAreas.length === 0) { setError('Please select at least one practice area'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/lawyer-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, yearsOfExperience: Number(form.yearsOfExperience), practiceAreaSlugs: selectedAreas }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message ?? 'Submission failed');
      setSubmitted(true);
      toast.success('Application submitted successfully!');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Submission failed');
    } finally { setLoading(false); }
  }

  if (submitted) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm max-w-md w-full p-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h1>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          Your application is under review. Once approved by our admin team, you will receive your login credentials via email. This typically takes <strong>1–2 business days</strong>.
        </p>
        <div className="bg-slate-50 rounded-2xl p-4 text-sm text-slate-600 space-y-2 text-left mb-6">
          {['Application received & logged', 'Admin reviews your credentials', 'Account created & credentials sent', 'You sign in and start accepting clients'].map((s, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              {s}
            </div>
          ))}
        </div>
        <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-slate-900 mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Scale className="h-4 w-4 text-white" />
            </div>
            LawSphere
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mt-4">Apply as a Lawyer</h1>
          <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">
            Fill in your details. Our admin team will review your application and send you login credentials once approved.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-900 mb-5">Personal Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { field: 'firstName',  label: 'First Name *',  placeholder: 'Rahul',               type: 'text' },
                { field: 'lastName',   label: 'Last Name *',   placeholder: 'Sharma',              type: 'text' },
                { field: 'email',      label: 'Email Address *', placeholder: 'you@example.com', type: 'email' },
                { field: 'phone',      label: 'Phone Number',  placeholder: '+91 98765 43210',     type: 'tel' },
              ].map(f => (
                <div key={f.field}>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">{f.label}</label>
                  <input
                    type={f.type}
                    required={f.label.includes('*')}
                    value={form[f.field as keyof typeof form]}
                    onChange={e => update(f.field, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Professional */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-900 mb-5">Professional Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Bar Council Enrollment No. *</label>
                <input required value={form.barCouncilNumber} onChange={e => update('barCouncilNumber', e.target.value)}
                  placeholder="DL/1234/2012"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Bar Council State *</label>
                <select required value={form.barCouncilState} onChange={e => update('barCouncilState', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white">
                  <option value="">Select Bar Council</option>
                  {BAR_COUNCILS.map(bc => <option key={bc} value={bc}>{bc}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Years of Experience *</label>
                <input required type="number" min="0" max="50" value={form.yearsOfExperience} onChange={e => update('yearsOfExperience', e.target.value)}
                  placeholder="12"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">City *</label>
                <input required value={form.city} onChange={e => update('city', e.target.value)} placeholder="New Delhi"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Professional Headline</label>
                <input value={form.headline} onChange={e => update('headline', e.target.value)}
                  placeholder="e.g. Senior Advocate — Property & Civil Law, Delhi High Court"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Bio</label>
                <textarea rows={3} value={form.bio} onChange={e => update('bio', e.target.value)}
                  placeholder="Brief description of your experience, specialisations, and notable cases..."
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" />
              </div>
            </div>
          </div>

          {/* Practice Areas */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-900 mb-1">Practice Areas *</h2>
            <p className="text-xs text-slate-400 mb-4">Select all areas you practice in</p>
            <div className="flex flex-wrap gap-2">
              {PRACTICE_AREAS.map(a => (
                <button key={a.slug} type="button" onClick={() => toggleArea(a.slug)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                    selectedAreas.includes(a.slug)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300',
                  )}>
                  {selectedAreas.includes(a.slug) && <span className="mr-1">✓</span>}{a.name}
                </button>
              ))}
            </div>
            {selectedAreas.length > 0 && (
              <p className="text-xs text-indigo-600 mt-2">{selectedAreas.length} area{selectedAreas.length > 1 ? 's' : ''} selected</p>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm text-center border border-red-100">{error}</div>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base font-semibold" size="lg">
            {loading
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting Application…</>
              : <>Submit Application <ChevronRight className="ml-2 h-4 w-4" /></>}
          </Button>

          <p className="text-center text-sm text-slate-500">
            Already have credentials?{' '}
            <Link href="/login" className="text-indigo-600 font-medium hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
