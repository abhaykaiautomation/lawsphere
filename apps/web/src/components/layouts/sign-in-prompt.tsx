import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LockKeyhole } from 'lucide-react';

export function SignInPrompt({ message = 'Sign in to access this page' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-5">
        <LockKeyhole className="h-7 w-7 text-indigo-500" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">{message}</h2>
      <p className="text-slate-400 text-sm mb-8 max-w-xs">
        Create a free account or sign in to continue. It only takes 10 seconds with Google.
      </p>
      <div className="flex gap-3">
        <Button asChild variant="outline" className="h-10">
          <Link href="/login">Sign In</Link>
        </Button>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700 h-10">
          <Link href="/register">Create Free Account</Link>
        </Button>
      </div>
    </div>
  );
}
