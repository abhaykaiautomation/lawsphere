'use client';

import { useState } from 'react';
import { Bell, CheckCheck, FileText, Calendar, ShieldCheck, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

const allNotifications = [
  { id: '1', type: 'CASE', title: 'AI Analysis Complete', message: 'Your case "Property Dispute with Neighbour" has been analysed. 3 lawyers matched.', time: '10 mins ago', read: false, icon: FileText, color: 'bg-indigo-50 text-indigo-600' },
  { id: '2', type: 'APPOINTMENT', title: 'Consultation Confirmed', message: 'Adv. Rahul Sharma confirmed your consultation on 16 May at 10:00 AM.', time: '1 hr ago', read: false, icon: Calendar, color: 'bg-emerald-50 text-emerald-600' },
  { id: '3', type: 'MESSAGE', title: 'New Message', message: 'Adv. Rahul Sharma: "Please share the property documents at your earliest convenience."', time: '2 hrs ago', read: false, icon: MessageSquare, color: 'bg-sky-50 text-sky-600' },
  { id: '4', type: 'SYSTEM', title: 'Account Verified', message: 'Your email address has been verified successfully. Welcome to LawSphere!', time: 'Yesterday', read: true, icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-600' },
  { id: '5', type: 'APPOINTMENT', title: 'Consultation Reminder', message: 'Your consultation with Adv. Priya Nair is tomorrow at 3:00 PM.', time: '2 days ago', read: true, icon: Calendar, color: 'bg-amber-50 text-amber-600' },
  { id: '6', type: 'CASE', title: 'Lawyer Recommendation', message: 'Based on your case update, we found 2 new matching lawyers for you.', time: '3 days ago', read: true, icon: FileText, color: 'bg-violet-50 text-violet-600' },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(allNotifications);
  const unread = notifications.filter(n => !n.read).length;

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  function markRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="outline" onClick={markAllRead} className="gap-2 text-sm h-9">
            <CheckCheck className="h-4 w-4" />Mark all read
          </Button>
        )}
      </div>

      {unread === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Bell className="h-6 w-6 text-slate-400" />
          </div>
          <p className="font-medium text-slate-900">You&apos;re all caught up</p>
          <p className="text-sm text-slate-400 mt-1">No new notifications</p>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((n) => (
          <button
            key={n.id}
            onClick={() => markRead(n.id)}
            className={`w-full flex items-start gap-4 p-5 rounded-2xl border text-left transition-all hover:shadow-sm ${n.read ? 'bg-white border-slate-100' : 'bg-indigo-50/50 border-indigo-100'}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.color}`}>
              <n.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm font-semibold ${n.read ? 'text-slate-700' : 'text-slate-900'}`}>{n.title}</p>
                <span className="text-xs text-slate-400 shrink-0">{n.time}</span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
            </div>
            {!n.read && <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />}
          </button>
        ))}
      </div>
    </div>
  );
}
