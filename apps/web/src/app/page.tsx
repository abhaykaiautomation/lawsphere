import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Scale, Shield, Brain, Video, FileText, Star, ArrowRight, CheckCircle, ChevronRight } from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI Legal Intake', description: 'Describe your issue in plain language. Our AI classifies, scores urgency, and finds the right lawyer instantly.', color: 'bg-indigo-50 text-indigo-600' },
  { icon: Shield, title: 'Verified Lawyers', description: 'Every lawyer is manually verified with Bar Council credentials before appearing on the platform.', color: 'bg-emerald-50 text-emerald-600' },
  { icon: Video, title: 'Video Consultations', description: 'Consult face-to-face via secure HD video calls with session notes and AI-generated summaries.', color: 'bg-violet-50 text-violet-600' },
  { icon: FileText, title: 'Document Management', description: 'Upload, store, and share legal documents securely with AI-powered analysis.', color: 'bg-sky-50 text-sky-600' },
  { icon: Scale, title: 'Smart Matching', description: 'Matched by specialization, ratings, location, and availability — not just keywords.', color: 'bg-amber-50 text-amber-600' },
  { icon: Star, title: 'Transparent Reviews', description: 'Read verified reviews from real clients before booking your consultation.', color: 'bg-rose-50 text-rose-600' },
];

const stats = [
  { value: '10,000+', label: 'Cases Resolved' },
  { value: '500+', label: 'Verified Lawyers' },
  { value: '4.8/5', label: 'Average Rating' },
  { value: '15+', label: 'Practice Areas' },
];

const steps = [
  { step: '01', title: 'Describe Your Issue', description: 'Tell us your legal problem in plain language — no legal jargon needed.' },
  { step: '02', title: 'AI Analysis', description: 'Our AI classifies the issue, scores urgency, and shortlists the best-matched lawyers.' },
  { step: '03', title: 'Book & Consult', description: 'Pick a lawyer, pay securely, and consult via video, audio, or chat.' },
];

const practiceAreas = [
  'Property Law', 'Family Law', 'Corporate Law', 'Criminal Law',
  'Employment Law', 'Immigration', 'Tax Law', 'Intellectual Property',
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Scale className="h-4 w-4 text-white" />
            </div>
            LawSphere
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/lawyers" className="text-slate-600 hover:text-slate-900 transition-colors">Find Lawyers</Link>
            <Link href="#how-it-works" className="text-slate-600 hover:text-slate-900 transition-colors">How It Works</Link>
            <Link href="#practice-areas" className="text-slate-600 hover:text-slate-900 transition-colors">Practice Areas</Link>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="text-slate-600 hover:text-slate-900">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700 rounded-lg">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900" />
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 75% 20%, #818cf8 0%, transparent 40%)' }} />
        <div className="relative container py-28 md:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              AI-Powered Legal Platform for India
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
              Legal Help You Can{' '}
              <span className="text-indigo-400">Trust & Afford</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-xl mb-10 leading-relaxed">
              Describe your legal problem in plain language. Our AI instantly classifies your issue,
              scores urgency, and connects you with the right verified lawyer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="bg-indigo-600 hover:bg-indigo-700 text-white h-12 px-8 rounded-xl text-base font-semibold">
                <Link href="/register">Start for Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-slate-600 text-white hover:bg-slate-800 h-12 px-8 rounded-xl text-base">
                <Link href="/lawyers">Browse Lawyers</Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-6 mt-10 text-sm text-slate-400">
              {['Free AI analysis', 'No credit card required', '500+ verified lawyers'].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-indigo-400" />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 border-b bg-white">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-bold text-indigo-600">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-3">Simple Process</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">How LawSphere Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((s, i) => (
              <div key={s.step} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-slate-200 -translate-x-4 z-0" />
                )}
                <div className="relative bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mx-auto mb-5">
                    {s.step}
                  </div>
                  <h3 className="font-semibold text-slate-900 text-lg mb-2">{s.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-3">Platform Features</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Everything in One Place</h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">
              From AI-powered intake to secure video consultations, LawSphere handles your entire legal journey.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="group p-6 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all bg-white">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${f.color}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-slate-900 text-base mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Practice Areas */}
      <section id="practice-areas" className="py-24 bg-slate-50">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-3">Expertise</p>
            <h2 className="text-3xl font-bold text-slate-900">Practice Areas</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {practiceAreas.map((area) => (
              <Link key={area} href={`/lawyers?area=${encodeURIComponent(area)}`}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-all">
                {area} <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-indigo-600">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Resolve Your Legal Matter?</h2>
          <p className="text-indigo-200 mb-10 text-lg max-w-xl mx-auto">
            Join thousands of clients who found the right legal help through LawSphere.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-white text-indigo-600 hover:bg-indigo-50 h-12 px-8 rounded-xl font-semibold">
              <Link href="/register">Start as Client</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/40 text-white hover:bg-white/10 h-12 px-8 rounded-xl font-semibold">
              <Link href="/register?role=lawyer">Join as Lawyer</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t bg-white">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center">
              <Scale className="h-3.5 w-3.5 text-white" />
            </div>
            LawSphere
          </div>
          <p>© {new Date().getFullYear()} LawSphere Technologies. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-slate-900 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
