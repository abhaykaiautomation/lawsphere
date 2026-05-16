import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, Star, MapPin, Briefcase, Filter } from 'lucide-react';

const areas = ['All', 'Property Law', 'Family Law', 'Corporate Law', 'Criminal Law', 'Employment Law', 'Immigration Law'];

export default async function LawyersPage() {
  const lawyers = await prisma.lawyerProfile.findMany({
    where: { verificationStatus: 'VERIFIED', deletedAt: null },
    orderBy: { averageRating: 'desc' },
    include: {
      practiceAreas: {
        where: { isPrimary: true },
        include: { practiceArea: { select: { name: true } } },
        take: 1,
      },
    },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 py-12">
        <div className="container">
          <h1 className="text-3xl font-bold text-white mb-2">Find a Lawyer</h1>
          <p className="text-slate-400 mb-6">Browse {lawyers.length} verified lawyers across all practice areas</p>
          <div className="flex gap-3 max-w-2xl">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input className="w-full pl-11 pr-4 py-3 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Search by name, area, or city..." />
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700 px-6 h-auto rounded-xl gap-2 py-3">
              <Filter className="h-4 w-4" />Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {areas.map((a) => (
            <button key={a} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${a === 'All' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'}`}>{a}</button>
          ))}
        </div>

        <p className="text-sm text-slate-500 mb-5 font-medium">{lawyers.length} verified lawyers</p>

        {lawyers.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <p className="text-lg font-medium">No verified lawyers yet</p>
            <p className="text-sm mt-1">Check back soon or ask an admin to verify lawyer accounts.</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {lawyers.map((l) => {
            const primaryArea = l.practiceAreas[0]?.practiceArea.name ?? 'General Practice';
            return (
              <div key={l.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                      {l.firstName[0]}{l.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 text-sm">Adv. {l.firstName} {l.lastName}</p>
                        <span className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center shrink-0" title="Verified">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </span>
                      </div>
                      {l.city && <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400"><MapPin className="h-3 w-3" />{l.city}</div>}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />{primaryArea}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{l.yearsOfExperience} yrs exp.</span>
                  </div>

                  <div className="flex items-center justify-between text-sm mb-5">
                    {/* Rating — only show if the lawyer has reviews */}
                    {Number(l.totalReviews) > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        <span className="font-semibold text-slate-900">{Number(l.averageRating).toFixed(1)}</span>
                        <span className="text-slate-400 text-xs">({l.totalReviews} reviews)</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">New lawyer</span>
                    )}
                    {/* Fee — show "Contact" if not yet set */}
                    <div className="text-right">
                      {Number(l.consultationFee) > 0 ? (
                        <>
                          <p className="font-bold text-slate-900">₹{Number(l.consultationFee).toLocaleString('en-IN')}</p>
                          <p className="text-xs text-slate-400">per session</p>
                        </>
                      ) : (
                        <p className="text-xs text-slate-500 italic">Fee not set</p>
                      )}
                    </div>
                  </div>

                  <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 h-9 text-sm">
                    <Link href={`/lawyers/${l.slug}`}>Book Consultation</Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
