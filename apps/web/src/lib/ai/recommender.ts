import { prisma } from '@/lib/prisma';
import { logAiCall } from './log';

export async function recommendLawyers(params: {
  caseId: string;
  practiceAreaSlug: string;
  location?: string;
  budget?: number;
  languages?: string[];
  urgency: string;
}) {
  const { caseId, practiceAreaSlug, location, budget, languages, urgency } = params;

  const candidates = await prisma.lawyerProfile.findMany({
    where: {
      deletedAt: null,
      verificationStatus: 'VERIFIED',
      isProfileComplete: true,
      availabilityStatus: { in: ['AVAILABLE', 'BUSY'] },
      practiceAreas: { some: { practiceArea: { slug: practiceAreaSlug } } },
      ...(budget && { consultationFee: { lte: budget } }),
      ...(languages?.length && { languages: { hasSome: languages } }),
    },
    take: 20,
    include: { practiceAreas: { include: { practiceArea: true } } },
    orderBy: [{ averageRating: 'desc' }, { totalConsultations: 'desc' }],
  });

  if (candidates.length === 0) return [];

  const scored = candidates.map((lawyer) => {
    const specializationMatch = lawyer.practiceAreas.some(
      (pa) => pa.practiceArea.slug === practiceAreaSlug && pa.isPrimary,
    ) ? 1.0 : 0.7;

    const locationMatch = location && lawyer.city
      ? lawyer.city.toLowerCase().includes(location.toLowerCase()) ? 1.0 : 0.5
      : 0.5;

    const ratingScore = Number(lawyer.averageRating) / 5;
    const availabilityScore = lawyer.availabilityStatus === 'AVAILABLE' ? 1.0 : 0.6;
    const experienceScore = Math.min(lawyer.yearsOfExperience / 20, 1);
    const priceScore = budget ? Math.max(0, 1 - Number(lawyer.consultationFee) / budget) : 0.5;

    const urgencyWeight = urgency === 'CRITICAL' ? 0.25 : 0.15;
    const score =
      specializationMatch * 0.30 +
      ratingScore * 0.25 +
      availabilityScore * urgencyWeight +
      experienceScore * 0.15 +
      locationMatch * 0.10 +
      priceScore * (budget ? 0.10 : 0);

    return { lawyerProfileId: lawyer.id, score, factors: { specializationMatch, locationMatch, ratingScore, availabilityScore, experienceScore, priceScore } };
  });

  const top5 = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((r, i) => ({ ...r, rank: i + 1, reasoning: `Top match based on ${practiceAreaSlug} specialization, ratings, and availability` }));

  await prisma.$transaction(
    top5.map((r) =>
      prisma.aiRecommendation.upsert({
        where: { caseId_lawyerProfileId: { caseId, lawyerProfileId: r.lawyerProfileId } },
        update: { rank: r.rank, score: r.score, factors: r.factors as never },
        create: {
          caseId,
          lawyerProfileId: r.lawyerProfileId,
          rank: r.rank,
          score: r.score,
          reasoning: { text: r.reasoning } as never,
          factors: r.factors as never,
        },
      }),
    ),
  );

  await logAiCall({ caseId, taskType: 'LAWYER_RECOMMENDATION', model: 'algorithmic-v1', outputData: top5 });

  return top5;
}
