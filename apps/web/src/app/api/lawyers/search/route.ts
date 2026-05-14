import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ok, handleError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const practiceArea = searchParams.get('practiceArea') ?? undefined;
    const city = searchParams.get('city') ?? undefined;
    const state = searchParams.get('state') ?? undefined;
    const language = searchParams.get('language') ?? undefined;
    const minRating = searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined;
    const maxFee = searchParams.get('maxFee') ? Number(searchParams.get('maxFee')) : undefined;
    const page = Number(searchParams.get('page') ?? 1);
    const limit = Number(searchParams.get('limit') ?? 10);
    const skip = (page - 1) * limit;

    const where: Prisma.LawyerProfileWhereInput = {
      deletedAt: null,
      verificationStatus: 'VERIFIED',
      isProfileComplete: true,
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(state && { state: { contains: state, mode: 'insensitive' } }),
      ...(language && { languages: { has: language } }),
      ...(minRating && { averageRating: { gte: minRating } }),
      ...(maxFee && { consultationFee: { lte: maxFee } }),
      ...(practiceArea && { practiceAreas: { some: { practiceArea: { slug: practiceArea } } } }),
    };

    const [lawyers, total] = await Promise.all([
      prisma.lawyerProfile.findMany({
        where, skip, take: limit,
        orderBy: [{ isFeatured: 'desc' }, { averageRating: 'desc' }, { totalConsultations: 'desc' }],
        include: { user: { select: { avatarUrl: true } }, practiceAreas: { include: { practiceArea: true } } },
      }),
      prisma.lawyerProfile.count({ where }),
    ]);

    return ok({ lawyers, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (e) {
    return handleError(e);
  }
}
