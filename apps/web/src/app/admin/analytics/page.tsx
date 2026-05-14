import { TrendingUp, Users, DollarSign, FileText, Scale, ArrowUpRight } from 'lucide-react';

const kpis = [
  { label: 'Total Revenue', value: '₹24.6L', change: '+18%', icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
  { label: 'New Users', value: '1,240', change: '+12%', icon: Users, color: 'bg-indigo-50 text-indigo-600' },
  { label: 'Cases Filed', value: '892', change: '+23%', icon: FileText, color: 'bg-violet-50 text-violet-600' },
  { label: 'Consultations', value: '634', change: '+9%', icon: Scale, color: 'bg-sky-50 text-sky-600' },
];

const topAreas = [
  { area: 'Property Law', cases: 234, pct: 26 },
  { area: 'Family Law', cases: 187, pct: 21 },
  { area: 'Corporate Law', cases: 156, pct: 17 },
  { area: 'Criminal Law', cases: 134, pct: 15 },
  { area: 'Employment Law', cases: 98, pct: 11 },
  { area: 'Others', cases: 83, pct: 9 },
];

const monthly = [
  { month: 'Jan', revenue: 180000, cases: 62 },
  { month: 'Feb', revenue: 210000, cases: 74 },
  { month: 'Mar', revenue: 195000, cases: 69 },
  { month: 'Apr', revenue: 260000, cases: 91 },
  { month: 'May', revenue: 246000, cases: 88 },
];

export default function AnalyticsPage() {
  const maxRevenue = Math.max(...monthly.map(m => m.revenue));
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Analytics</h1><p className="text-slate-500 text-sm mt-0.5">Platform performance and insights</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-500">{k.label}</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${k.color}`}><k.icon className="h-4 w-4" /></div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{k.value}</p>
            <div className="flex items-center gap-1 mt-1.5 text-xs text-emerald-600 font-medium">
              <ArrowUpRight className="h-3.5 w-3.5" />{k.change} this month
            </div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue chart (CSS bars) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6"><TrendingUp className="h-5 w-5 text-slate-400" /><h2 className="font-semibold text-slate-900">Monthly Revenue</h2></div>
          <div className="flex items-end gap-3 h-40">
            {monthly.map(m => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-slate-400">₹{(m.revenue / 100000).toFixed(1)}L</span>
                <div className="w-full bg-indigo-600 rounded-t-lg transition-all" style={{ height: `${(m.revenue / maxRevenue) * 100}%` }} />
                <span className="text-xs font-medium text-slate-500">{m.month}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Practice areas */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-6">Cases by Practice Area</h2>
          <div className="space-y-4">
            {topAreas.map(a => (
              <div key={a.area}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-700 font-medium">{a.area}</span>
                  <span className="text-slate-400">{a.cases} cases</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${a.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
