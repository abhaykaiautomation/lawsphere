import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, Star, MapPin, Briefcase, Filter } from 'lucide-react';

const lawyers = [
  { id: '1', name: 'Adv. Rahul Sharma', slug: 'rahul-sharma', area: 'Property Law', city: 'New Delhi', experience: '12 yrs', rating: 4.9, reviews: 134, fee: 2500, verified: true },
  { id: '2', name: 'Adv. Priya Nair', slug: 'priya-nair', area: 'Family Law', city: 'Mumbai', experience: '8 yrs', rating: 4.8, reviews: 89, fee: 2000, verified: true },
  { id: '3', name: 'Adv. Sanjay Patel', slug: 'sanjay-patel', area: 'Corporate Law', city: 'Ahmedabad', experience: '11 yrs', rating: 4.7, reviews: 112, fee: 3000, verified: true },
  { id: '4', name: 'Adv. Meena Iyer', slug: 'meena-iyer', area: 'Immigration Law', city: 'Bangalore', experience: '6 yrs', rating: 4.6, reviews: 67, fee: 1800, verified: true },
  { id: '5', name: 'Adv. Vikram Mehta', slug: 'vikram-mehta', area: 'Criminal Law', city: 'New Delhi', experience: '15 yrs', rating: 4.9, reviews: 201, fee: 3500, verified: true },
  { id: '6', name: 'Adv. Sunita Kapoor', slug: 'sunita-kapoor', area: 'Employment Law', city: 'Hyderabad', experience: '9 yrs', rating: 4.7, reviews: 93, fee: 2200, verified: true },
];

const areas = ['All', 'Property Law', 'Family Law', 'Corporate Law', 'Criminal Law', 'Employment Law', 'Immigration'];

export default function LawyersPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 py-12">
        <div className="container">
          <h1 className="text-3xl font-bold text-white mb-2">Find a Lawyer</h1>
          <p className="text-slate-400 mb-6">Browse verified lawyers across all practice areas</p>
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
        <p className="text-sm text-slate-500 mb-5 font-medium">{lawyers.length} lawyers found</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {lawyers.map((l) => (
            <div key={l.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all overflow-hidden">
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                    {l.name.split(' ').map(n => n[0]).join('').slice(1, 3)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 text-sm">{l.name}</p>
                      {l.verified && <span className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center shrink-0"><svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></span>}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400"><MapPin className="h-3 w-3" />{l.city}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1"><Briefcase className="h-3 w-3" />{l.area}</span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{l.experience} exp.</span>
                </div>
                <div className="flex items-center justify-between text-sm mb-5">
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span className="font-semibold text-slate-900">{l.rating}</span>
                    <span className="text-slate-400 text-xs">({l.reviews})</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">₹{l.fee.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-slate-400">per session</p>
                  </div>
                </div>
                <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 h-9 text-sm">
                  <Link href={`/lawyers/${l.slug}`}>Book Consultation</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
