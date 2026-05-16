import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  MapPin, Briefcase, Star, Clock, Shield,
  ArrowLeft, Calendar, Video, Phone, MessageSquare,
  CheckCircle2, Award, Languages,
} from 'lucide-react';

export default async function LawyerProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const lawyer = await prisma.lawyerProfile.findUnique({
    where: { slug, deletedAt: null },
    include: {
      user: { select: { email: true } },
      practiceAreas: {
        include: { practiceArea: true },
        orderBy: { isPrimary: 'desc' },
      },
      educations: { orderBy: { startYear: 'desc' } },
      experiences: { orderBy: { startDate: 'desc' } },
      reviews: {
        where: { isPublic: true },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { clientProfile: { select: { firstName: true, lastName: true } } },
      },
    },
  });

  if (!lawyer || lawyer.verificationStatus !== 'VERIFIED') return notFound();

  const fee      = Number(lawyer.consultationFee);
  const rating   = Number(lawyer.averageRating);
  const platform = Number(fee) * 0.1;
  const total    = fee + platform;

  const consultModes = [
    { icon: Video,         label: 'Video Call',  available: true },
    { icon: Phone,         label: 'Audio Call',  available: true },
    { icon: MessageSquare, label: 'Chat',         available: false },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back */}
      <div className="bg-white border-b border-slate-100">
        <div className="container py-3">
          <Link href="/lawyers" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />Back to Lawyers
          </Link>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* ── Main ───────────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Profile header */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl shrink-0">
                  {lawyer.firstName[0]}{lawyer.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold text-slate-900">
                      Adv. {lawyer.firstName} {lawyer.lastName}
                    </h1>
                    <span className="flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
                      <Shield className="h-3 w-3" />Verified
                    </span>
                  </div>
                  {lawyer.headline && (
                    <p className="text-slate-500 mt-1 text-sm">{lawyer.headline}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
                    {lawyer.city && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-slate-400" />{lawyer.city}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4 text-slate-400" />{lawyer.yearsOfExperience} years experience
                    </span>
                    {rating > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        {rating.toFixed(1)} ({lawyer.totalReviews} reviews)
                      </span>
                    )}
                    {lawyer.totalConsultations > 0 && (
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-slate-400" />{lawyer.totalConsultations} consultations
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {lawyer.practiceAreas.map(pa => (
                      <span key={pa.id} className={`text-xs px-2.5 py-1 rounded-full font-medium ${pa.isPrimary ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                        {pa.practiceArea.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            {lawyer.bio && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="font-semibold text-slate-900 mb-3">About</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{lawyer.bio}</p>
              </div>
            )}

            {/* Bar Council */}
            {lawyer.barCouncilNumber && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-indigo-500" />Bar Council Details
                </h2>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Enrollment Number</p>
                    <p className="font-semibold text-slate-900">{lawyer.barCouncilNumber}</p>
                  </div>
                  {lawyer.barCouncilState && (
                    <div>
                      <p className="text-slate-400 text-xs mb-1">State Bar Council</p>
                      <p className="font-semibold text-slate-900">{lawyer.barCouncilState}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Education */}
            {lawyer.educations.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="font-semibold text-slate-900 mb-4">Education</h2>
                <div className="space-y-4">
                  {lawyer.educations.map(edu => (
                    <div key={edu.id} className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                        <Award className="h-5 w-5 text-indigo-500" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{edu.degree}</p>
                        <p className="text-xs text-slate-500">{edu.institution}</p>
                        <p className="text-xs text-slate-400">{edu.startYear} – {edu.endYear ?? 'Present'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {lawyer.experiences.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="font-semibold text-slate-900 mb-4">Experience</h2>
                <div className="space-y-4">
                  {lawyer.experiences.map(exp => (
                    <div key={exp.id} className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <Briefcase className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{exp.title}</p>
                        <p className="text-xs text-slate-500">{exp.organization}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(exp.startDate).getFullYear()} – {exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : ''}
                        </p>
                        {exp.description && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{exp.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {lawyer.reviews.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-semibold text-slate-900">Client Reviews</h2>
                  {rating > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-slate-900">{rating.toFixed(1)}</span>
                      <span className="text-slate-400 text-sm">/ 5</span>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {lawyer.reviews.map(review => (
                    <div key={review.id} className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-900">
                          {review.clientProfile.firstName} {review.clientProfile.lastName[0]}.
                        </p>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                          ))}
                        </div>
                      </div>
                      {review.comment && <p className="text-xs text-slate-500 leading-relaxed">{review.comment}</p>}
                      <p className="text-xs text-slate-400 mt-2">{new Date(review.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Booking sidebar ─────────────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Fee card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  {fee > 0 ? (
                    <>
                      <p className="text-3xl font-bold text-slate-900">₹{fee.toLocaleString('en-IN')}</p>
                      <p className="text-sm text-slate-400">per session (30 min)</p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-semibold text-slate-500">Fee not set</p>
                      <p className="text-xs text-slate-400 mt-0.5">Contact lawyer to enquire</p>
                    </>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <div className={`w-2 h-2 rounded-full ${lawyer.availabilityStatus === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                    <span className={`text-xs font-medium ${lawyer.availabilityStatus === 'AVAILABLE' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {lawyer.availabilityStatus === 'AVAILABLE' ? 'Available' : 'Busy'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Consultation modes */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {consultModes.map(m => (
                  <div key={m.label} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${m.available ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-slate-50 text-slate-300'}`}>
                    <m.icon className="h-4 w-4" />
                    {m.label}
                  </div>
                ))}
              </div>

              {/* Fee breakdown — only if fee is set */}
              {fee > 0 && (
                <div className="bg-slate-50 rounded-xl p-4 mb-5 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Consultation fee</span>
                    <span>₹{fee.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-xs">
                    <span>Platform fee (10%)</span>
                    <span>₹{platform.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-900 border-t border-slate-200 pt-2">
                    <span>Total</span>
                    <span>₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              )}

              <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 font-semibold gap-2">
                <Link href={`/client/book/${lawyer.slug}`}>
                  <Calendar className="h-4 w-4" />
                  {fee > 0 ? 'Book Consultation' : 'Request Consultation'}
                </Link>
              </Button>

              <p className="text-xs text-slate-400 text-center mt-3 leading-relaxed">
                {fee > 0 ? 'Payment is collected after the lawyer confirms your appointment' : 'The lawyer will discuss their fee when they confirm your request'}
              </p>
            </div>

            {/* Quick info */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-900 text-sm mb-4">Quick Info</h3>
              <div className="space-y-3 text-sm">
                {[
                  { icon: Clock, label: 'Response time', value: 'Usually within 2 hrs' },
                  { icon: Languages, label: 'Languages', value: (lawyer.languages ?? ['en']).map((l: string) => l === 'en' ? 'English' : l === 'hi' ? 'Hindi' : l).join(', ') },
                  { icon: MapPin, label: 'Location', value: lawyer.city ? `${lawyer.city}${lawyer.state ? `, ${lawyer.state}` : ''}` : 'India' },
                  { icon: CheckCircle2, label: 'Member since', value: new Date(lawyer.createdAt).getFullYear().toString() },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                      <item.icon className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400">{item.label}</p>
                      <p className="font-medium text-slate-900 text-xs">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
