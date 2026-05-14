import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SignInPrompt } from '@/components/layouts/sign-in-prompt';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Brain, Calendar, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';

export default async function CaseDetailPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('lawsphere_token')?.value;
  let userId: string;
  try {
    if (!token) throw new Error();
    userId = verifyToken(token).sub;
  } catch {
    return <SignInPrompt message="Sign in to view case details" />;
  }

  const clientProfile = await prisma.clientProfile.findUnique({ where: { userId } });
  if (!clientProfile) return <SignInPrompt message="Sign in to view case details" />;

  const legalCase = await prisma.case.findUnique({
    where: { id: params.id },
    include: {
      practiceArea: true,
      recommendations: {
        orderBy: { rank: 'asc' },
        take: 5,
        include: {
          lawyerProfile: {
            include: {
              practiceAreas: { include: { practiceArea: true }, take: 2 },
            },
          },
        },
      },
    },
  });

  if (!legalCase || legalCase.clientProfileId !== clientProfile.id) return notFound();

  const urgencyColor: Record<string, string> = {
    CRITICAL: 'bg-red-100 text-red-700', HIGH: 'bg-orange-100 text-orange-700',
    MEDIUM: 'bg-yellow-100 text-yellow-700', LOW: 'bg-green-100 text-green-700',
  };
  const statusColor: Record<string, string> = {
    MATCHED: 'bg-indigo-100 text-indigo-700', IN_CONSULTATION: 'bg-emerald-100 text-emerald-700',
    SUBMITTED: 'bg-blue-100 text-blue-700', DRAFT: 'bg-slate-100 text-slate-500',
  };

  const entities = legalCase.aiExtractedEntities as Record<string, unknown> | null;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/client/cases" className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{legalCase.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${urgencyColor[legalCase.urgency] ?? ''}`}>{legalCase.urgency}</span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[legalCase.status] ?? 'bg-slate-100 text-slate-600'}`}>{legalCase.status.replace('_', ' ')}</span>
            {legalCase.practiceArea && <span className="text-xs text-slate-400">{legalCase.practiceArea.name}</span>}
            <span className="text-xs text-slate-400">#{legalCase.caseNumber}</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Description */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-slate-400" />
              <h2 className="font-semibold text-slate-900">Case Description</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{legalCase.description}</p>
          </div>

          {/* AI Analysis */}
          {legalCase.aiSummary ? (
            <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <h2 className="font-semibold text-slate-900">AI Analysis</h2>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />GPT-4o
                </span>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mb-4">{legalCase.aiSummary}</p>

              {legalCase.urgency === 'CRITICAL' || legalCase.urgency === 'HIGH' ? (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 rounded-xl border border-red-100 mb-4">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">
                    This case has been flagged as <strong>{legalCase.urgency}</strong> urgency. We recommend consulting a lawyer as soon as possible.
                  </p>
                </div>
              ) : null}

              {entities && Object.keys(entities).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Extracted Entities</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(entities).map(([key, val]) => (
                      <span key={key} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full capitalize">
                        {key.replace(/_/g, ' ')}: {String(val)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center text-slate-400 text-sm">
              <Loader className="h-5 w-5 animate-spin mx-auto mb-2" />
              AI analysis in progress…
            </div>
          )}

          {/* Lawyer Recommendations */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <h2 className="font-semibold text-slate-900">Recommended Lawyers</h2>
              {legalCase.recommendations.length > 0 && (
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{legalCase.recommendations.length} matches</span>
              )}
            </div>

            {legalCase.recommendations.length === 0 ? (
              <div className="px-6 py-10 text-center text-slate-400 text-sm">
                {legalCase.status === 'DRAFT' || legalCase.status === 'SUBMITTED'
                  ? 'AI is still matching lawyers for your case…'
                  : 'No lawyer matches found. Try broadening your location preference.'}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {legalCase.recommendations.map((rec, i) => {
                  const l = rec.lawyerProfile;
                  const scorePercent = Math.round(Number(rec.score) * 100);
                  return (
                    <div key={rec.id} className="flex items-center gap-4 px-6 py-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                        {l.firstName[0]}{l.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 text-sm">Adv. {l.firstName} {l.lastName}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {l.practiceAreas.map(a => a.practiceArea.name).join(', ')}
                          {l.city ? ` · ${l.city}` : ''}
                          {` · ${l.yearsOfExperience} yrs`}
                          {Number(l.averageRating) > 0 ? ` · ★ ${Number(l.averageRating).toFixed(1)}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {i === 0 && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Best Match</span>}
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Match score</p>
                          <p className="text-sm font-bold text-indigo-600">{scorePercent}%</p>
                        </div>
                        <Button size="sm" asChild className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs">
                          <Link href={`/lawyers/${l.slug}`}>
                            Book ₹{Number(l.consultationFee).toLocaleString('en-IN')}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="font-semibold text-slate-900 text-sm mb-4">Case Details</h2>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Case No.', value: legalCase.caseNumber },
                { label: 'Practice Area', value: legalCase.practiceArea?.name ?? '—' },
                { label: 'Status', value: legalCase.status.replace('_', ' ') },
                { label: 'Urgency', value: legalCase.urgency },
                { label: 'Filed', value: legalCase.createdAt.toLocaleDateString('en-IN') },
                { label: 'Recommendations', value: `${legalCase.recommendations.length} lawyers` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-slate-400">{label}</span>
                  <span className="font-medium text-slate-900 text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-2">
            <h2 className="font-semibold text-slate-900 text-sm mb-3">Actions</h2>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 justify-start gap-2 h-9 text-sm" asChild>
              <Link href="/client/consultations"><Calendar className="h-4 w-4" />Schedule Consultation</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 h-9 text-sm" asChild>
              <Link href="/client/documents"><FileText className="h-4 w-4" />Upload Documents</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 h-9 text-sm" asChild>
              <Link href="/client/messages"><MessageSquare className="h-4 w-4" />Message Lawyer</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline loader for the AI pending state
function Loader({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}
