'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Shield, Palette, Globe, LogOut, Trash2 } from 'lucide-react';

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-10 h-6 rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-slate-200'}`}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
    </button>
  );
}

export default function SettingsPage() {
  const [notifs, setNotifs] = useState({ email: true, sms: false, push: true, marketing: false });
  const [privacy, setPrivacy] = useState({ profileVisible: true, showRating: true });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your account preferences</p>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Bell className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Notifications</h2>
            <p className="text-xs text-slate-400">Choose how you want to be notified</p>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
            { key: 'sms', label: 'SMS Notifications', desc: 'Receive updates via text message' },
            { key: 'push', label: 'Push Notifications', desc: 'Receive browser push notifications' },
            { key: 'marketing', label: 'Marketing Emails', desc: 'Tips, updates and promotional offers' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
              <Toggle
                checked={notifs[item.key as keyof typeof notifs]}
                onChange={() => setNotifs(p => ({ ...p, [item.key]: !p[item.key as keyof typeof notifs] }))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Shield className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Privacy</h2>
            <p className="text-xs text-slate-400">Control your profile visibility</p>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { key: 'profileVisible', label: 'Public Profile', desc: 'Allow others to find your profile' },
            { key: 'showRating', label: 'Show Ratings', desc: 'Display your ratings publicly' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
              <Toggle
                checked={privacy[item.key as keyof typeof privacy]}
                onChange={() => setPrivacy(p => ({ ...p, [item.key]: !p[item.key as keyof typeof privacy] }))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
            <Palette className="h-4 w-4 text-violet-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Preferences</h2>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900">Language</p>
                <p className="text-xs text-slate-400">Select your preferred language</p>
              </div>
            </div>
            <select className="text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-700">
              <option>English</option>
              <option>Hindi</option>
              <option>Tamil</option>
              <option>Telugu</option>
              <option>Marathi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-red-100">
          <h2 className="font-semibold text-red-700">Danger Zone</h2>
        </div>
        <div className="divide-y divide-red-50 px-6">
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium text-slate-900">Sign Out</p>
              <p className="text-xs text-slate-400">Sign out from your account</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 text-slate-600 h-8">
              <LogOut className="h-3.5 w-3.5" />Sign Out
            </Button>
          </div>
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium text-red-600">Delete Account</p>
              <p className="text-xs text-slate-400">Permanently delete your account and all data</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 text-red-600 border-red-200 hover:bg-red-50 h-8">
              <Trash2 className="h-3.5 w-3.5" />Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
