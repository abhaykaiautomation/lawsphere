'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';
import {
  Scale, LayoutDashboard, FileText, Calendar, Users,
  MessageSquare, Bell, Settings, LogOut, PlusCircle,
  Shield, LogIn, BarChart2, UserCheck, Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Portal configs ──────────────────────────────────────────────────────────

const portals = {
  client: {
    label: 'Client Portal',
    accent: 'bg-indigo-600',
    activeItem: 'bg-indigo-600',
    signInBg: 'bg-indigo-600 hover:bg-indigo-700',
    badge: 'bg-indigo-500',
    nav: [
      { href: '/client/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/client/intake',    icon: PlusCircle,      label: 'New Case' },
      { href: '/lawyers',          icon: Users,           label: 'Find Lawyers' },
      { href: '/client/consultations', icon: Calendar,    label: 'Consultations' },
      { href: '/client/documents', icon: FileText,        label: 'Documents' },
      { href: '/client/messages',  icon: MessageSquare,   label: 'Messages' },
    ],
  },
  lawyer: {
    label: 'Lawyer Portal',
    accent: 'bg-emerald-600',
    activeItem: 'bg-emerald-600',
    signInBg: 'bg-emerald-600 hover:bg-emerald-700',
    badge: 'bg-emerald-500',
    nav: [
      { href: '/lawyer/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/lawyer/appointments', icon: Calendar,        label: 'Appointments' },
      { href: '/lawyer/profile',      icon: Briefcase,       label: 'My Profile' },
      { href: '/lawyer/documents',    icon: FileText,        label: 'Documents' },
      { href: '/lawyer/messages',     icon: MessageSquare,   label: 'Messages' },
    ],
  },
  admin: {
    label: 'Admin Portal',
    accent: 'bg-violet-600',
    activeItem: 'bg-violet-600',
    signInBg: 'bg-violet-600 hover:bg-violet-700',
    badge: 'bg-violet-500',
    nav: [
      { href: '/admin/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/admin/users',         icon: Users,           label: 'Users' },
      { href: '/admin/verifications', icon: UserCheck,       label: 'Verifications' },
      { href: '/admin/analytics',     icon: BarChart2,       label: 'Analytics' },
    ],
  },
};

function getPortal(pathname: string) {
  // /lawyer/* = lawyer portal   /lawyers/* = public directory (client portal)
  if (pathname === '/lawyer' || pathname.startsWith('/lawyer/')) return portals.lawyer;
  if (pathname.startsWith('/admin'))  return portals.admin;
  return portals.client;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const portal = getPortal(pathname);
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'U';

  function handleLogout() {
    clearAuth();
    router.push('/login');
  }

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 z-40">

      {/* Logo + portal badge */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-700">
        <div className={`w-8 h-8 rounded-lg ${portal.accent} flex items-center justify-center shrink-0`}>
          <Scale className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm leading-tight">LawSphere</p>
          <p className="text-xs text-slate-400 truncate">{portal.label}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {portal.nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? `${portal.activeItem} text-white`
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
      <div className="px-3 pb-5 space-y-0.5 border-t border-slate-700 pt-4">
        <Link href="/notifications" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
          <Bell className="h-4 w-4 shrink-0" />Notifications
        </Link>
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
          <Settings className="h-4 w-4 shrink-0" />Settings
        </Link>

        {/* User card / Sign-in */}
        {user ? (
          <div className="flex items-center gap-3 px-3 py-3 mt-1 rounded-lg bg-slate-800">
            <div className={`w-8 h-8 rounded-full ${portal.badge} flex items-center justify-center text-xs font-bold shrink-0`}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{user.email}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role.toLowerCase()}</p>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-colors" title="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link href="/login" className={`flex items-center gap-3 px-3 py-3 mt-1 rounded-lg ${portal.signInBg} transition-colors`}>
            <LogIn className="h-4 w-4 text-white shrink-0" />
            <span className="text-sm font-semibold text-white">Sign In</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
