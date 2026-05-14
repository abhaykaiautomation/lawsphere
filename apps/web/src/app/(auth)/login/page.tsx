'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Scale } from 'lucide-react';

export default function LoginPage() {
  const router   = useRouter();
  const setAuth  = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  async function handleGoogleSignIn() {
    setLoading(true);
    setError('');
    try {
      const result  = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await fetch('/api/auth/firebase-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // No role sent — server determines role from DB or admin email list
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) throw new Error('Sign-in failed');
      const { data } = await res.json();

      // New user with no account yet → send to register to pick role
      if (data.needsRegistration) {
        router.push('/register');
        return;
      }

      setAuth(data.user, data.token);

      // Redirect by role
      if (data.user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (data.user.role === 'LAWYER') {
        router.push(data.user.status === 'ACTIVE' ? '/lawyer/dashboard' : '/lawyer/pending');
      } else {
        router.push('/client/dashboard');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  }

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
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-slate-500 mt-1 text-sm">Sign in to your LawSphere account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm text-center border border-red-100">
              {error}
            </div>
          )}

          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center gap-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm h-12"
            size="lg"
          >
            <GoogleIcon />
            {loading ? 'Signing in…' : 'Continue with Google'}
          </Button>

          {/* Role hint */}
          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'Clients', desc: 'Legal help' },
              { label: 'Lawyers', desc: 'Accept cases' },
              { label: 'Admins', desc: 'Platform' },
            ].map(r => (
              <div key={r.label} className="bg-white border border-slate-100 rounded-xl p-2.5">
                <p className="text-xs font-semibold text-slate-700">{r.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{r.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-400 text-center">One Google account works for all roles</p>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-indigo-600 font-medium hover:underline">Sign up</Link>
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
