import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, handleError } from '@/lib/errors';

export async function GET(req: NextRequest, { params }: { params: { lawyerProfileId: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') ?? 1);
    const limit = Number(searchParams.get('limit') ?? 10);
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { lawyerProfileId: params.lawyerProfileId, isPublic: true },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { clientProfile: { select: { firstName: true, lastName: true } } },
      }),
      prisma.review.count({ where: { lawyerProfileId: params.lawyerProfileId, isPublic: true } }),
    ]);
    return ok({ reviews, total, page, limit });
  } catch (e) {
    return handleError(e);
  }
}
