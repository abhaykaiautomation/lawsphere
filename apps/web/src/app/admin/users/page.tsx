import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Search } from 'lucide-react';

const roleColor: Record<string, string> = {
  CLIENT: 'bg-sky-100 text-sky-700',
  LAWYER: 'bg-violet-100 text-violet-700',
  ADMIN:  'bg-rose-100 text-rose-700',
};
const statusColor: Record<string, string> = {
  ACTIVE:               'bg-emerald-100 text-emerald-700',
  PENDING_VERIFICATION: 'bg-yellow-100 text-yellow-700',
  INACTIVE:             'bg-slate-100 text-slate-500',
  SUSPENDED:            'bg-red-100 text-red-700',
};

export default async function AdminUsersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('lawsphere_token')?.value;
  try {
    if (!token) throw new Error();
    const { role } = verifyToken(token);
    if (role !== 'ADMIN') redirect('/login');
  } catch { redirect('/login'); }

  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: {
      clientProfile: { select: { firstName: true, lastName: true } },
      lawyerProfile: { select: { firstName: true, lastName: true, verificationStatus: true } },
    },
  });

  const getName = (u: typeof users[0]) => {
    if (u.clientProfile) return `${u.clientProfile.firstName} ${u.clientProfile.lastName}`.trim();
    if (u.lawyerProfile) return `Adv. ${u.lawyerProfile.firstName} ${u.lawyerProfile.lastName}`.trim();
    return '—';
  };

  const getInitials = (u: typeof users[0]) => {
    const name = getName(u);
    if (name === '—') return u.email.slice(0, 2).toUpperCase();
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-500 text-sm mt-0.5">{users.length} total users across all roles</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            placeholder="Search by name or email…" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['User', 'Email', 'Role', 'Status', 'Joined', 'Details'].map(h => (
                <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold shrink-0">
                      {getInitials(u)}
                    </div>
                    <p className="font-medium text-slate-900 text-sm">{getName(u)}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleColor[u.role] ?? 'bg-slate-100 text-slate-600'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[u.status] ?? 'bg-slate-100 text-slate-600'}`}>
                    {u.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400 text-xs">
                  {new Date(u.createdAt).toLocaleDateString('en-IN')}
                </td>
                <td className="px-6 py-4 text-slate-400 text-xs">
                  {u.lawyerProfile && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.lawyerProfile.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : u.lawyerProfile.verificationStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {u.lawyerProfile.verificationStatus}
                    </span>
                  )}
                  {u.firebaseUid && <span className="ml-1 text-xs bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded">Firebase</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
