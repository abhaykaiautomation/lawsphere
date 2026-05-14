import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding LawSphere database...');

  // ─── Practice Areas ─────────────────────────────────────────────────────────
  const areas = [
    { name: 'Family Law',          slug: 'family-law',          description: 'Divorce, custody, adoption, domestic relations', sortOrder: 1 },
    { name: 'Criminal Law',        slug: 'criminal-law',        description: 'Defense, prosecution, bail, appeals',           sortOrder: 2 },
    { name: 'Corporate Law',       slug: 'corporate-law',       description: 'Company formation, M&A, compliance, contracts', sortOrder: 3 },
    { name: 'Property Law',        slug: 'property-law',        description: 'Real estate, land disputes, tenant rights',     sortOrder: 4 },
    { name: 'Employment Law',      slug: 'employment-law',      description: 'Wrongful termination, discrimination, labour',  sortOrder: 5 },
    { name: 'Immigration Law',     slug: 'immigration-law',     description: 'Visas, citizenship, deportation defence',       sortOrder: 6 },
    { name: 'Intellectual Property', slug: 'intellectual-property', description: 'Patents, trademarks, copyrights',           sortOrder: 7 },
    { name: 'Tax Law',             slug: 'tax-law',             description: 'Tax planning, disputes, compliance',            sortOrder: 8 },
    { name: 'Civil Litigation',    slug: 'civil-litigation',    description: 'Disputes, damages, injunctions',               sortOrder: 9 },
    { name: 'Consumer Law',        slug: 'consumer-law',        description: 'Consumer protection, fraud, defective products', sortOrder: 10 },
    { name: 'Banking & Finance',   slug: 'banking-finance',     description: 'Loans, securities, regulatory compliance',      sortOrder: 11 },
    { name: 'Medical Law',         slug: 'medical-law',         description: 'Medical negligence, malpractice',               sortOrder: 12 },
  ];

  for (const area of areas) {
    await prisma.practiceArea.upsert({ where: { slug: area.slug }, update: {}, create: area });
  }
  console.log(`  ✓ ${areas.length} practice areas`);

  const propertyArea  = await prisma.practiceArea.findUnique({ where: { slug: 'property-law' } });
  const employmentArea = await prisma.practiceArea.findUnique({ where: { slug: 'employment-law' } });
  const familyArea    = await prisma.practiceArea.findUnique({ where: { slug: 'family-law' } });
  const corporateArea = await prisma.practiceArea.findUnique({ where: { slug: 'corporate-law' } });
  const criminalArea  = await prisma.practiceArea.findUnique({ where: { slug: 'criminal-law' } });

  // ─── Lawyer Users (3 verified, 2 pending) ───────────────────────────────────
  const lawyerSeeds = [
    {
      email: 'adv.rahul.sharma@lawsphere.in', firstName: 'Rahul',  lastName: 'Sharma',
      slug: 'rahul-sharma', barCouncil: 'DL/1234/2012', state: 'Delhi',
      city: 'New Delhi', experience: 12, fee: 2500, rating: 4.9, reviews: 134,
      status: 'ACTIVE' as const, verificationStatus: 'VERIFIED' as const,
      bio: 'Senior advocate with 12+ years in property and civil disputes. Former Additional District Judge.',
      primaryArea: propertyArea?.id, areas: [propertyArea?.id, familyArea?.id],
    },
    {
      email: 'adv.priya.nair@lawsphere.in',   firstName: 'Priya',  lastName: 'Nair',
      slug: 'priya-nair',    barCouncil: 'MH/5678/2016', state: 'Maharashtra',
      city: 'Mumbai', experience: 8, fee: 2000, rating: 4.8, reviews: 89,
      status: 'ACTIVE' as const, verificationStatus: 'VERIFIED' as const,
      bio: 'Specialises in family law and matrimonial disputes. High Court advocate.',
      primaryArea: familyArea?.id, areas: [familyArea?.id, employmentArea?.id],
    },
    {
      email: 'adv.vikram.mehta@lawsphere.in',  firstName: 'Vikram', lastName: 'Mehta',
      slug: 'vikram-mehta',  barCouncil: 'GJ/9012/2010', state: 'Gujarat',
      city: 'Ahmedabad', experience: 15, fee: 3500, rating: 4.9, reviews: 201,
      status: 'ACTIVE' as const, verificationStatus: 'VERIFIED' as const,
      bio: 'Criminal defence lawyer with 15 years of experience. Handled 500+ cases.',
      primaryArea: criminalArea?.id, areas: [criminalArea?.id, corporateArea?.id],
    },
    {
      email: 'adv.kavya.reddy@lawsphere.in',   firstName: 'Kavya',  lastName: 'Reddy',
      slug: 'kavya-reddy',   barCouncil: 'KA/3456/2018', state: 'Karnataka',
      city: 'Bangalore', experience: 6, fee: 1800, rating: 0, reviews: 0,
      status: 'PENDING_VERIFICATION' as const, verificationStatus: 'PENDING' as const,
      bio: 'Corporate lawyer with expertise in startup law and M&A transactions.',
      primaryArea: corporateArea?.id, areas: [corporateArea?.id],
    },
    {
      email: 'adv.sanjay.patel@lawsphere.in',  firstName: 'Sanjay', lastName: 'Patel',
      slug: 'sanjay-patel',  barCouncil: 'TN/7890/2020', state: 'Tamil Nadu',
      city: 'Chennai', experience: 4, fee: 1500, rating: 0, reviews: 0,
      status: 'PENDING_VERIFICATION' as const, verificationStatus: 'PENDING' as const,
      bio: 'Employment law specialist focusing on wrongful termination and workplace discrimination.',
      primaryArea: employmentArea?.id, areas: [employmentArea?.id],
    },
  ];

  const lawyerProfileIds: Record<string, string> = {};

  for (const l of lawyerSeeds) {
    const user = await prisma.user.upsert({
      where: { email: l.email },
      update: {},
      create: {
        email: l.email, role: 'LAWYER',
        emailVerified: true, status: l.status,
      },
    });

    const profile = await prisma.lawyerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        firstName: l.firstName, lastName: l.lastName,
        slug: l.slug, bio: l.bio,
        barCouncilNumber: l.barCouncil, barCouncilState: l.state,
        city: l.city, state: l.state,
        yearsOfExperience: l.experience,
        consultationFee: l.fee,
        averageRating: l.rating,
        totalReviews: l.reviews,
        verificationStatus: l.verificationStatus,
        availabilityStatus: l.verificationStatus === 'VERIFIED' ? 'AVAILABLE' : 'OFFLINE',
        isProfileComplete: l.verificationStatus === 'VERIFIED',
        languages: ['en', 'hi'],
      },
    });

    lawyerProfileIds[l.slug] = profile.id;

    for (const areaId of (l.areas.filter(Boolean) as string[])) {
      await prisma.lawyerPracticeArea.upsert({
        where: { lawyerProfileId_practiceAreaId: { lawyerProfileId: profile.id, practiceAreaId: areaId } },
        update: {},
        create: { lawyerProfileId: profile.id, practiceAreaId: areaId, isPrimary: areaId === l.primaryArea },
      });
    }
  }
  console.log(`  ✓ ${lawyerSeeds.length} lawyers (3 verified, 2 pending)`);

  // ─── Client Users ────────────────────────────────────────────────────────────
  const clientSeeds = [
    { email: 'rahul.mehta@example.com',  firstName: 'Rahul',  lastName: 'Mehta',  city: 'New Delhi',  state: 'Delhi' },
    { email: 'priya.sharma@example.com', firstName: 'Priya',  lastName: 'Sharma', city: 'Mumbai',     state: 'Maharashtra' },
    { email: 'amit.kumar@example.com',   firstName: 'Amit',   lastName: 'Kumar',  city: 'Bangalore',  state: 'Karnataka' },
  ];

  const clientProfileIds: Record<string, string> = {};

  for (const c of clientSeeds) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: { email: c.email, role: 'CLIENT', emailVerified: true, status: 'ACTIVE' },
    });

    const profile = await prisma.clientProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        firstName: c.firstName, lastName: c.lastName,
        city: c.city, state: c.state, country: 'IN',
      },
    });

    clientProfileIds[c.email] = profile.id;
  }
  console.log(`  ✓ ${clientSeeds.length} client users`);

  // ─── Cases ───────────────────────────────────────────────────────────────────
  const now = new Date();
  const caseSeedData = [
    {
      clientEmail: 'rahul.mehta@example.com',
      caseNumber: 'CASE-2026-001',
      title: 'Property Encroachment by Neighbour',
      description: 'My neighbour has illegally encroached on my property by constructing a wall 3 feet inside my land boundary. I have original property documents and survey reports.',
      status: 'MATCHED' as const, urgency: 'HIGH' as const,
      aiClassification: 'property-law',
      aiSummary: 'Civil property encroachment dispute with documentary evidence. Client has strong case for mandatory injunction.',
      aiExtractedEntities: { type: 'encroachment', evidence: ['property deed', 'survey report'], remedy: 'injunction' },
      practiceAreaId: propertyArea?.id,
      submittedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      clientEmail: 'rahul.mehta@example.com',
      caseNumber: 'CASE-2026-002',
      title: 'Wrongful Termination from Employment',
      description: 'I was terminated from my position of 5 years without any notice period or severance pay. The reason cited was performance but I have consistently received good ratings.',
      status: 'IN_CONSULTATION' as const, urgency: 'MEDIUM' as const,
      aiClassification: 'employment-law',
      aiSummary: 'Potential wrongful termination case. Client has employment records and performance appraisals as evidence.',
      aiExtractedEntities: { type: 'wrongful_termination', evidence: ['performance_appraisal', 'employment_contract'], tenure: '5 years' },
      practiceAreaId: employmentArea?.id,
      submittedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    },
    {
      clientEmail: 'priya.sharma@example.com',
      caseNumber: 'CASE-2026-003',
      title: 'Divorce and Child Custody',
      description: 'I am seeking divorce from my husband of 8 years due to irreconcilable differences and domestic disputes. We have two children aged 5 and 7.',
      status: 'MATCHED' as const, urgency: 'CRITICAL' as const,
      aiClassification: 'family-law',
      aiSummary: 'Divorce case with child custody complications. Immediate legal counsel required given critical urgency and minor children involved.',
      aiExtractedEntities: { type: 'divorce', children: 2, ages: [5, 7], duration: '8 years' },
      practiceAreaId: familyArea?.id,
      submittedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      clientEmail: 'amit.kumar@example.com',
      caseNumber: 'CASE-2026-004',
      title: 'Business Partnership Dispute',
      description: 'My business partner is refusing to honour our partnership agreement and is diverting company funds. I need immediate legal advice on dissolving the partnership.',
      status: 'SUBMITTED' as const, urgency: 'HIGH' as const,
      aiClassification: 'corporate-law',
      aiSummary: 'Partnership dissolution case with potential fraud. Urgent corporate legal action required.',
      aiExtractedEntities: { type: 'partnership_dispute', issue: 'fund_diversion' },
      practiceAreaId: corporateArea?.id,
      submittedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    },
  ];

  const caseIds: Record<string, string> = {};

  for (const c of caseSeedData) {
    const existing = await prisma.case.findUnique({ where: { caseNumber: c.caseNumber } });
    if (existing) { caseIds[c.caseNumber] = existing.id; continue; }

    const legalCase = await prisma.case.create({
      data: {
        caseNumber: c.caseNumber,
        clientProfileId: clientProfileIds[c.clientEmail],
        practiceAreaId: c.practiceAreaId ?? undefined,
        title: c.title,
        description: c.description,
        status: c.status,
        urgency: c.urgency,
        aiClassification: c.aiClassification,
        aiConfidenceScore: 0.91,
        aiUrgencyScore: 0.85,
        aiSummary: c.aiSummary,
        aiExtractedEntities: c.aiExtractedEntities,
        submittedAt: c.submittedAt,
      },
    });
    caseIds[c.caseNumber] = legalCase.id;
  }
  console.log(`  ✓ ${caseSeedData.length} cases`);

  // ─── Appointments ────────────────────────────────────────────────────────────
  const aptSeeds = [
    {
      number: 'APT-2026-001',
      clientEmail: 'rahul.mehta@example.com',
      lawyerSlug: 'rahul-sharma',
      caseNumber: 'CASE-2026-001',
      scheduledAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000),
      mode: 'VIDEO' as const, status: 'CONFIRMED' as const, durationMin: 30,
    },
    {
      number: 'APT-2026-002',
      clientEmail: 'rahul.mehta@example.com',
      lawyerSlug: 'priya-nair',
      caseNumber: 'CASE-2026-002',
      scheduledAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000),
      mode: 'VIDEO' as const, status: 'PENDING' as const, durationMin: 45,
    },
    {
      number: 'APT-2026-003',
      clientEmail: 'priya.sharma@example.com',
      lawyerSlug: 'priya-nair',
      caseNumber: 'CASE-2026-003',
      scheduledAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000),
      mode: 'VIDEO' as const, status: 'CONFIRMED' as const, durationMin: 60,
    },
    {
      number: 'APT-2026-004',
      clientEmail: 'amit.kumar@example.com',
      lawyerSlug: 'vikram-mehta',
      caseNumber: 'CASE-2026-004',
      scheduledAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000),
      mode: 'AUDIO' as const, status: 'PENDING' as const, durationMin: 30,
    },
  ];

  for (const a of aptSeeds) {
    const existing = await prisma.appointment.findUnique({ where: { appointmentNumber: a.number } });
    if (existing) continue;

    await prisma.appointment.create({
      data: {
        appointmentNumber: a.number,
        clientProfileId: clientProfileIds[a.clientEmail],
        lawyerProfileId: lawyerProfileIds[a.lawyerSlug],
        caseId: caseIds[a.caseNumber],
        scheduledAt: a.scheduledAt,
        mode: a.mode,
        status: a.status,
        durationMin: a.durationMin,
      },
    });
  }
  console.log(`  ✓ ${aptSeeds.length} appointments`);

  // ─── Notifications ───────────────────────────────────────────────────────────
  const rahulUser = await prisma.user.findUnique({ where: { email: 'rahul.mehta@example.com' } });
  const priyaUser = await prisma.user.findUnique({ where: { email: 'priya.sharma@example.com' } });

  if (rahulUser) {
    const notifData = [
      { type: 'LAWYER_VERIFIED' as const, title: 'AI Analysis Complete', body: 'Your case "Property Encroachment" has been analysed. 3 lawyers matched.', isRead: false },
      { type: 'APPOINTMENT_CONFIRMED' as const, title: 'Consultation Confirmed', body: 'Adv. Rahul Sharma confirmed your video consultation.', isRead: false },
      { type: 'SYSTEM_ALERT' as const, title: 'Welcome to LawSphere', body: 'Your account is set up. Describe your legal issue to get started.', isRead: true },
    ];
    for (const n of notifData) {
      await prisma.notification.create({ data: { userId: rahulUser.id, ...n } });
    }
  }

  if (priyaUser) {
    await prisma.notification.create({
      data: { userId: priyaUser.id, type: 'SYSTEM_ALERT' as const, title: 'Urgent: Lawyer Match Found', body: 'Adv. Priya Nair is available for your family law case.', isRead: false },
    });
  }
  console.log(`  ✓ notifications`);

  console.log('\n✅ Seeding complete!');
  console.log('\nSample login emails:');
  console.log('  Clients  : rahul.mehta@example.com | priya.sharma@example.com | amit.kumar@example.com');
  console.log('  Lawyers  : adv.rahul.sharma@lawsphere.in (verified) | adv.kavya.reddy@lawsphere.in (pending)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
