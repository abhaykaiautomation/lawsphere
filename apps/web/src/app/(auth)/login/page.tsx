'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Scale, Loader2, Eye, EyeOff, User, Briefcase, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

type Role = 'client' | 'lawyer' | 'admin';

const ROLES = [
  { value: 'client' as Role, icon: User,     label: 'Client',  desc: 'I need legal help' },
  { value: 'lawyer' as Role, icon: Briefcase, label: 'Lawyer',  desc: 'I provide legal services' },
  { value: 'admin'  as Role, icon: Shield,   label: 'Admin',   desc: 'Platform management' },
];

export default function LoginPage() {
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [role,     setRole]     = useState<Role>('client');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);

  function redirect(user: { role: string; status: string }) {
    if (user.role === 'ADMIN')  return router.push('/admin/dashboard');
    if (user.role === 'LAWYER') return router.push(user.status === 'ACTIVE' ? '/lawyer/dashboard' : '/lawyer/pending');
    router.push('/client/dashboard');
  }

  // ── Google sign-in (Client + Admin only) ────────────────────────────────────
  async function handleGoogle() {
    setLoading(true); setError('');
    try {
      const result  = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const res     = await fetch('/api/auth/firebase-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message ?? 'Sign-in failed');
      if (body.data.needsRegistration) { router.push('/register'); return; }

      // Enforce client-only Google sign-in
      if (body.data.user.role !== 'CLIENT') {
        throw new Error('This Google account is registered as a ' + body.data.user.role.toLowerCase() + '. Lawyers and admins use email/password sign-in.');
      }

      setAuth(body.data.user, body.data.token);
      redirect(body.data.user);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Sign-in failed';
      setError(msg.replace('Firebase: ', '').replace(' (auth/popup-closed-by-user).', ''));
    } finally { setLoading(false); }
  }

  // ── Email/password (Client: custom API | Lawyer: Firebase email/password) ──
  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (role === 'client') {
        // Custom bcrypt auth — clients only
        const res  = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body.message ?? 'Invalid credentials');
        setAuth(body.data.user, body.data.token);
        redirect(body.data.user);

      } else if (role === 'lawyer' || role === 'admin') {
        // Firebase email/password — lawyer credentials from admin, admin credentials from setup script
        const cred    = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await cred.user.getIdToken();
        const res     = await fetch('/api/auth/firebase-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body.message ?? 'Sign-in failed');

        const expectedRole = role.toUpperCase();
        if (body.data.user.role !== expectedRole) {
          throw new Error(`This account is not registered as a ${role}. Please select the correct role.`);
        }
        setAuth(body.data.user, body.data.token);
        redirect(body.data.user);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Sign-in failed';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        setError('Invalid email or password. Please check your credentials.');
      } else if (msg.includes('auth/user-not-found')) {
        setError('No account found with this email.');
      } else if (msg.includes('auth/too-many-requests')) {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError(msg.replace('Firebase: ', ''));
      }
    } finally { setLoading(false); }
  }

  const accentColor = role === 'lawyer' ? 'bg-emerald-600 hover:bg-emerald-700'
    : role === 'admin' ? 'bg-violet-600 hover:bg-violet-700'
    : 'bg-indigo-600 hover:bg-indigo-700';

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 text-white flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <Scale className="h-4 w-4 text-white" />
          </div>
          LawSphere
        </Link>
        <div>
          <blockquote className="text-2xl font-medium leading-relaxed mb-6">
            "LawSphere connected me with the perfect family lawyer in minutes."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">PR</div>
            <div>
              <div className="font-medium">Priya Rajan</div>
              <div className="text-sm text-indigo-300">Startup Founder, Bangalore</div>
            </div>
          </div>
        </div>
        <div className="text-indigo-300 text-sm">Trusted by 10,000+ clients across India</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-sm">
          <div className="text-center mb-7">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Sign In</h1>
            <p className="text-slate-500 mt-1 text-sm">Select your role to continue</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {ROLES.map(r => (
              <button key={r.value} onClick={() => { setRole(r.value); setError(''); }}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-xs font-medium',
                  role === r.value
                    ? r.value === 'lawyer' ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : r.value === 'admin' ? 'border-violet-600 bg-violet-50 text-violet-700'
                      : 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-500',
                )}>
                <r.icon className="h-5 w-5" />
                <span className="font-semibold">{r.label}</span>
                <span className="text-xs text-slate-400 font-normal leading-tight text-center">{r.desc}</span>
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm text-center border border-red-100">
              {error}
            </div>
          )}

          {/* ── CLIENT: Google + Email/Password ─────────────────────────── */}
          {role === 'client' && (
            <div className="space-y-4">
              <Button onClick={handleGoogle} disabled={loading}
                className="w-full flex items-center gap-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm h-12" size="lg">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
                {loading ? 'Signing in…' : 'Continue with Google'}
              </Button>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-medium">or</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <form onSubmit={handleEmail} className="space-y-3">
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-4 py-2.5 pr-11 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button type="submit" disabled={loading} className={`w-full h-11 font-semibold ${accentColor}`} size="lg">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in…</> : 'Sign In with Email'}
                </Button>
              </form>
            </div>
          )}

          {/* ── LAWYER: Firebase email/password only ────────────────────── */}
          {role === 'lawyer' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 text-xs text-emerald-700 leading-relaxed">
                <p className="font-semibold mb-1">Lawyer Sign-In</p>
                Use the <strong>email and temporary password</strong> sent to you after your application was approved by admin. Haven&apos;t applied yet?{' '}
                <Link href="/lawyer-apply" className="underline font-semibold">Apply here</Link>
              </div>
              <form onSubmit={handleEmail} className="space-y-3">
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Your registered email"
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Password from admin credentials"
                    className="w-full px-4 py-2.5 pr-11 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                  <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button type="submit" disabled={loading} className={`w-full h-11 font-semibold ${accentColor}`} size="lg">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying…</> : 'Sign In as Lawyer'}
                </Button>
              </form>
            </div>
          )}

          {/* ── ADMIN: Firebase email/password only ─────────────────────── */}
          {role === 'admin' && (
            <div className="space-y-4">
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-3.5 text-xs text-violet-700 leading-relaxed">
                <p className="font-semibold mb-1">Admin Sign-In</p>
                Use the credentials shared with you by the platform owner. Unauthorised access is monitored.
              </div>
              <form onSubmit={handleEmail} className="space-y-3">
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Admin email address"
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Admin password"
                    className="w-full px-4 py-2.5 pr-11 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
                  <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button type="submit" disabled={loading} className={`w-full h-11 font-semibold ${accentColor}`} size="lg">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying…</> : 'Sign In as Admin'}
                </Button>
              </form>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-indigo-600 font-medium hover:underline">Sign up</Link>
            {' · '}
            <Link href="/lawyer-apply" className="text-emerald-600 font-medium hover:underline">Apply as lawyer</Link>
          </p>
        </div>
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
