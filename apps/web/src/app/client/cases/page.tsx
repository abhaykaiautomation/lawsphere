import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SignInPrompt } from '@/components/layouts/sign-in-prompt';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, ArrowRight } from 'lucide-react';

export default async function CasesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('lawsphere_token')?.value;
  let userId: string;
  try {
    if (!token) throw new Error();
    userId = verifyToken(token).sub;
  } catch {
    return <SignInPrompt message="Sign in to view your cases" />;
  }

  const clientProfile = await prisma.clientProfile.findUnique({ where: { userId } });
  const cases = clientProfile
    ? await prisma.case.findMany({
        where: { clientProfileId: clientProfile.id, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        include: { practiceArea: true, recommendations: { select: { id: true } } },
      })
    : [];

  const urgencyColor: Record<string, string> = {
    CRITICAL: 'bg-red-100 text-red-700', HIGH: 'bg-orange-100 text-orange-700',
    MEDIUM: 'bg-yellow-100 text-yellow-700', LOW: 'bg-green-100 text-green-700',
  };
  const statusColor: Record<string, string> = {
    MATCHED: 'bg-indigo-100 text-indigo-700', IN_CONSULTATION: 'bg-emerald-100 text-emerald-700',
    SUBMITTED: 'bg-blue-100 text-blue-700', DRAFT: 'bg-slate-100 text-slate-500',
    RESOLVED: 'bg-green-100 text-green-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Cases</h1>
          <p className="text-slate-500 text-sm mt-0.5">All your legal cases in one place</p>
        </div>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Link href="/client/intake"><PlusCircle className="h-4 w-4" />New Case</Link>
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <p className="text-sm text-slate-500 font-medium">{cases.length} case{cases.length !== 1 ? 's' : ''} total</p>
        </div>

        {cases.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-indigo-400" />
            </div>
            <p className="font-medium text-slate-900 mb-1">No cases yet</p>
            <p className="text-sm text-slate-400 mb-4">Describe your legal issue and our AI will match you with the right lawyer.</p>
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700 gap-2">
              <Link href="/client/intake"><PlusCircle className="h-4 w-4" />Submit Your First Case</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {cases.map((c) => (
              <Link key={c.id} href={`/client/cases/${c.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">{c.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {c.practiceArea?.name ?? 'General'} · {c.createdAt.toLocaleDateString('en-IN')}
                    {c.recommendations.length > 0 && ` · ${c.recommendations.length} lawyer match${c.recommendations.length > 1 ? 'es' : ''}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${urgencyColor[c.urgency] ?? ''}`}>{c.urgency}</span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[c.status] ?? 'bg-slate-100 text-slate-600'}`}>{c.status.replace('_', ' ')}</span>
                  <ArrowRight className="h-4 w-4 text-slate-300" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
