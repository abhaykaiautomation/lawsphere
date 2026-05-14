'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';
import {
  Scale, LayoutDashboard, FileText, Calendar, Users,
  MessageSquare, Bell, Settings, LogOut, PlusCircle, Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const clientNav = [
  { href: '/client/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/client/intake', icon: PlusCircle, label: 'New Case' },
  { href: '/lawyers', icon: Users, label: 'Find Lawyers' },
  { href: '/client/consultations', icon: Calendar, label: 'Consultations' },
  { href: '/client/documents', icon: FileText, label: 'Documents' },
  { href: '/client/messages', icon: MessageSquare, label: 'Messages' },
];

const lawyerNav = [
  { href: '/lawyer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/lawyer/appointments', icon: Calendar, label: 'Appointments' },
  { href: '/lawyer/profile', icon: Users, label: 'My Profile' },
  { href: '/lawyer/documents', icon: FileText, label: 'Documents' },
  { href: '/lawyer/messages', icon: MessageSquare, label: 'Messages' },
];

const adminNav = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/verifications', icon: Shield, label: 'Verifications' },
  { href: '/admin/analytics', icon: FileText, label: 'Analytics' },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const nav = user?.role === 'LAWYER' ? lawyerNav : user?.role === 'ADMIN' ? adminNav : clientNav;
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'U';

  function handleLogout() {
    clearAuth();
    router.push('/login');
  }

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-700">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
          <Scale className="h-5 w-5 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight">LawSphere</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800',
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-6 space-y-1 border-t border-slate-700 pt-4">
        <Link href="/notifications" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
          <Bell className="h-4 w-4" />
          Notifications
        </Link>
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
          <Settings className="h-4 w-4" />
          Settings
        </Link>

        {/* User */}
        <div className="flex items-center gap-3 px-3 py-3 mt-2 rounded-lg bg-slate-800">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.email ?? ''}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role?.toLowerCase() ?? ''}</p>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-colors" title="Sign out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
