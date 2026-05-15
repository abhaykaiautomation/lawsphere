'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Plus, X } from 'lucide-react';

const practiceAreaOptions = ['Property Law', 'Family Law', 'Corporate Law', 'Criminal Law', 'Employment Law', 'Immigration', 'Tax Law', 'Civil Law'];

export default function LawyerProfilePage() {
  const [areas, setAreas] = useState(['Property Law', 'Civil Law']);

  function toggleArea(area: string) {
    setAreas(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 text-sm mt-0.5">Update your professional information</p>
      </div>

      {/* Avatar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-900 mb-5">Profile Photo</h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl">RS</div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors">
              <Camera className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">Adv. Rahul Sharma</p>
            <p className="text-xs text-slate-400 mt-0.5">Bar Council No: DL/12345/2012</p>
            <span className="inline-block mt-2 text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">Verified</span>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-900 mb-5">Personal Information</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {[
            { label: 'First Name', value: 'Rahul', placeholder: 'First name' },
            { label: 'Last Name', value: 'Sharma', placeholder: 'Last name' },
            { label: 'Email', value: 'rahul.sharma@lawsphere.in', placeholder: 'Email' },
            { label: 'Phone', value: '+91 98765 43210', placeholder: 'Phone' },
            { label: 'City', value: 'New Delhi', placeholder: 'City' },
            { label: 'Bar Council No.', value: 'DL/12345/2012', placeholder: 'Bar Council number' },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">{f.label}</label>
              <input defaultValue={f.value} placeholder={f.placeholder} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
          ))}
        </div>
        <div className="mt-5">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Bio</label>
          <textarea rows={4} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" defaultValue="Senior advocate with 12+ years of experience in property and civil disputes. Former additional district judge." />
        </div>
      </div>

      {/* Practice Areas */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-900 mb-5">Practice Areas</h2>
        <div className="flex flex-wrap gap-2">
          {practiceAreaOptions.map((area) => (
            <button key={area} onClick={() => toggleArea(area)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${areas.includes(area) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}>
              {areas.includes(area) ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* Fees */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-900 mb-5">Consultation Fee</h2>
        <div className="flex items-center gap-3 max-w-xs">
          <span className="text-slate-500 font-medium">₹</span>
          <input type="number" defaultValue={2500} className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          <span className="text-slate-400 text-sm">/ session</span>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button className="bg-indigo-600 hover:bg-indigo-700">Save Changes</Button>
      </div>
    </div>
  );
}
