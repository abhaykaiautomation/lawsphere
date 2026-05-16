'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Camera, Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ALL_AREAS = [
  'Property Law', 'Family Law', 'Corporate Law', 'Criminal Law',
  'Employment Law', 'Immigration Law', 'Tax Law', 'Civil Litigation',
  'Consumer Law', 'Banking & Finance', 'Medical Law', 'Intellectual Property',
];

interface ProfileData {
  id: string;
  firstName: string; lastName: string; bio: string | null;
  headline: string | null; barCouncilNumber: string | null;
  barCouncilState: string | null; city: string | null;
  yearsOfExperience: number; consultationFee: number;
  verificationStatus: string; averageRating: number;
  practiceAreas: { practiceArea: { name: string }; isPrimary: boolean }[];
  user: { email: string; phone: string | null };
}

export default function LawyerProfilePage() {
  const token = useAuthStore((s) => s.token);
  const [profile, setProfile]   = useState<ProfileData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [error,   setError]     = useState('');
  const [areas,   setAreas]     = useState<string[]>([]);

  // Editable fields
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [bio,       setBio]       = useState('');
  const [headline,  setHeadline]  = useState('');
  const [city,      setCity]      = useState('');
  const [fee,       setFee]       = useState('');

  useEffect(() => {
    if (!token) return;
    fetch('/api/lawyers/me/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(({ data }) => {
        setProfile(data);
        setFirstName(data.firstName ?? '');
        setLastName(data.lastName ?? '');
        setBio(data.bio ?? '');
        setHeadline(data.headline ?? '');
        setCity(data.city ?? '');
        setFee(String(data.consultationFee ?? 0));
        setAreas(data.practiceAreas.map((pa: { practiceArea: { name: string } }) => pa.practiceArea.name));
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [token]);

  function toggleArea(area: string) {
    setAreas(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]);
  }

  async function handleSave() {
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/lawyers/me/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ firstName, lastName, bio, headline, city, consultationFee: Number(fee) }),
      });
      if (!res.ok) throw new Error('Save failed');
      toast.success('Profile saved successfully');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Save failed';
      setError(msg);
      toast.error(msg);
    } finally { setSaving(false); }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
      <Loader2 className="h-5 w-5 animate-spin" />Loading profile…
    </div>
  );

  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-500 text-sm mt-0.5">Update your professional information</p>
        </div>
        {profile?.verificationStatus === 'VERIFIED' && (
          <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full font-medium">✓ Verified</span>
        )}
      </div>

      {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">{error}</div>}

      {/* Avatar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-900 mb-5">Profile</h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-2xl">
              {initials || '??'}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center hover:bg-emerald-700 transition-colors">
              <Camera className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Adv. {firstName} {lastName}</p>
            {profile?.barCouncilNumber && (
              <p className="text-xs text-slate-400 mt-0.5">Bar Council: {profile.barCouncilNumber}</p>
            )}
            <p className="text-xs text-slate-400 mt-0.5">{profile?.user.email}</p>
            {Number(profile?.averageRating) > 0 && (
              <p className="text-xs text-amber-600 mt-0.5">★ {Number(profile?.averageRating).toFixed(1)} rating</p>
            )}
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-900 mb-5">Personal Information</h2>
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">First Name</label>
            <input value={firstName} onChange={e => setFirstName(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Last Name</label>
            <input value={lastName} onChange={e => setLastName(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Email</label>
            <input value={profile?.user.email ?? ''} disabled
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-400 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">City</label>
            <input value={city} onChange={e => setCity(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
          </div>
          {profile?.barCouncilNumber && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Bar Council No.</label>
              <input value={profile.barCouncilNumber} disabled
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-400 cursor-not-allowed" />
            </div>
          )}
          {profile?.barCouncilState && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Bar Council State</label>
              <input value={profile.barCouncilState} disabled
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-400 cursor-not-allowed" />
            </div>
          )}
        </div>

        <div className="mt-5">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Professional Headline</label>
          <input value={headline} onChange={e => setHeadline(e.target.value)}
            placeholder="e.g. Senior Advocate — Property & Civil Law"
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
        </div>

        <div className="mt-5">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Bio</label>
          <textarea rows={4} value={bio} onChange={e => setBio(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none" />
        </div>
      </div>

      {/* Practice Areas */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-900 mb-5">Practice Areas</h2>
        <div className="flex flex-wrap gap-2">
          {ALL_AREAS.map((area) => (
            <button key={area} onClick={() => toggleArea(area)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                areas.includes(area)
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
              }`}>
              {areas.includes(area) ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              {area}
            </button>
          ))}
        </div>
        {areas.length > 0 && (
          <p className="text-xs text-emerald-600 mt-2">{areas.length} area{areas.length > 1 ? 's' : ''} selected</p>
        )}
      </div>

      {/* Fees */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-900 mb-5">Consultation Fee</h2>
        <div className="flex items-center gap-3 max-w-xs">
          <span className="text-slate-500 font-medium">₹</span>
          <input type="number" value={fee} onChange={e => setFee(e.target.value)} min="0"
            className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
          <span className="text-slate-400 text-sm">/ session</span>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => window.location.reload()}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
