import { Search, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

const users = [
  { id: '1', name: 'Rahul Mehta', email: 'rahul@example.com', role: 'CLIENT', status: 'ACTIVE', joined: '2026-04-01', cases: 3 },
  { id: '2', name: 'Priya Singh', email: 'priya@example.com', role: 'CLIENT', status: 'ACTIVE', joined: '2026-04-15', cases: 1 },
  { id: '3', name: 'Adv. Rahul Sharma', email: 'adv.rahul@example.com', role: 'LAWYER', status: 'ACTIVE', joined: '2026-03-10', cases: 47 },
  { id: '4', name: 'Adv. Kavya Reddy', email: 'kavya@example.com', role: 'LAWYER', status: 'PENDING', joined: '2026-05-06', cases: 0 },
  { id: '5', name: 'Amit Kumar', email: 'amit@example.com', role: 'CLIENT', status: 'SUSPENDED', joined: '2026-02-20', cases: 2 },
];
const roleColor: Record<string, string> = { CLIENT: 'bg-sky-100 text-sky-700', LAWYER: 'bg-violet-100 text-violet-700', ADMIN: 'bg-rose-100 text-rose-700' };
const statusColor: Record<string, string> = { ACTIVE: 'bg-emerald-100 text-emerald-700', PENDING: 'bg-yellow-100 text-yellow-700', SUSPENDED: 'bg-red-100 text-red-700' };

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Users</h1><p className="text-slate-500 text-sm mt-0.5">Manage all platform users</p></div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">Export CSV</Button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><input className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Search by name or email..." /></div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['User', 'Role', 'Status', 'Joined', 'Cases/Consults', 'Actions'].map(h => (
                <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">{u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                    <div><p className="font-medium text-slate-900">{u.name}</p><p className="text-xs text-slate-400">{u.email}</p></div>
                  </div>
                </td>
                <td className="px-6 py-4"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleColor[u.role]}`}>{u.role}</span></td>
                <td className="px-6 py-4"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[u.status]}`}>{u.status}</span></td>
                <td className="px-6 py-4 text-slate-500 text-xs">{u.joined}</td>
                <td className="px-6 py-4 font-semibold text-slate-900">{u.cases}</td>
                <td className="px-6 py-4"><button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><MoreHorizontal className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
