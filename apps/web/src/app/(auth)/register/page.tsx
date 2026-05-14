'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Scale, User, Briefcase, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Method = 'google' | 'email';

export default function RegisterPage() {
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [role,    setRole]    = useState<'client' | 'lawyer'>('client');
  const [method,  setMethod]  = useState<Method>('google');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPwd,   setShowPwd]   = useState(false);

  async function handleGoogle() {
    setLoading(true); setError('');
    try {
      const result  = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const [fn = '', ...rest] = (result.user.displayName ?? '').split(' ');
      const res = await fetch('/api/auth/firebase-sync', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, role: 'CLIENT', firstName: fn, lastName: rest.join(' ') }),
      });
      if (!res.ok) throw new Error('Registration failed');
      const { data } = await res.json();
      setAuth(data.user, data.token);
      router.push('/client/dashboard');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    } finally { setLoading(false); }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 8)  { setError('Password must be at least 8 characters'); return; }
    setLoading(true); setError('');
    try {
      const res  = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'CLIENT', firstName, lastName }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message ?? 'Registration failed');
      setAuth(body.data.user, body.data.token);
      router.push('/client/dashboard');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-12 px-4">
      <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-slate-900 mb-8">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center"><Scale className="h-4 w-4 text-white" /></div>
        LawSphere
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <h1 className="text-2xl font-bold text-slate-900 text-center mb-1">Create your account</h1>
        <p className="text-sm text-slate-500 text-center mb-7">Join thousands using LawSphere</p>

        {/* Role selector */}
        <p className="text-sm text-slate-500 mb-3 text-center">I want to join as</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {([
            { value: 'client', label: 'Client', icon: User, description: 'I need legal help' },
            { value: 'lawyer', label: 'Lawyer', icon: Briefcase, description: 'I provide legal services' },
          ] as const).map(r => (
            <button key={r.value} type="button" onClick={() => { setRole(r.value); setError(''); }}
              className={cn('flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm',
                role === r.value ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-indigo-300 text-slate-600')}>
              <r.icon className="h-6 w-6" />
              <span className="font-semibold">{r.label}</span>
              <span className="text-xs text-slate-400">{r.description}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm text-center border border-red-100">{error}</div>
        )}

        {/* ── Lawyer: apply form redirect ────────────────────────────────── */}
        {role === 'lawyer' && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700">
              <p className="font-semibold mb-1">Lawyer Registration Process</p>
              <ol className="space-y-1 text-xs list-decimal list-inside">
                <li>Fill in your professional details &amp; Bar Council credentials</li>
                <li>Admin reviews your application (1–2 business days)</li>
                <li>On approval, login credentials are created and shared with you</li>
                <li>Sign in with provided credentials to access your portal</li>
              </ol>
            </div>
            <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 font-semibold gap-2" size="lg">
              <Link href="/lawyer-apply">Start Lawyer Application <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        )}

        {/* ── Client: Google or email/password ──────────────────────────── */}
        {role === 'client' && (
          <>
            <div className="flex bg-slate-100 rounded-xl p-1 mb-5">
              {(['google', 'email'] as const).map(m => (
                <button key={m} onClick={() => setMethod(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${method === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  {m === 'google' ? 'Google' : 'Email'}
                </button>
              ))}
            </div>

            {method === 'google' && (
              <Button onClick={handleGoogle} disabled={loading}
                className="w-full flex items-center gap-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm h-12" size="lg">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
                {loading ? 'Creating account…' : 'Continue with Google'}
              </Button>
            )}

            {method === 'email' && (
              <form onSubmit={handleEmail} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">First Name *</label>
                    <input required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Rahul"
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Last Name *</label>
                    <input required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Mehta"
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Email *</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Password *</label>
                  <div className="relative">
                    <input type={showPwd ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters"
                      className="w-full px-3 py-2.5 pr-10 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                    <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Confirm Password *</label>
                  <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 font-semibold" size="lg">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account…</> : 'Create Account'}
                </Button>
              </form>
            )}
          </>
        )}

        <p className="mt-5 text-xs text-slate-400 text-center">
          By registering, you agree to our{' '}
          <Link href="/terms" className="text-indigo-600 hover:underline">Terms</Link> and{' '}
          <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>.
        </p>
        <p className="mt-3 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
