import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, notFound, err, handleError } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const { sub } = getCurrentUser(req);
    const { consultationId, rating, title, body } = await req.json();

    const clientProfile = await prisma.clientProfile.findUnique({ where: { userId: sub } });
    if (!clientProfile) return notFound('Client profile not found');

    const consultation = await prisma.consultation.findFirst({
      where: { id: consultationId, status: 'COMPLETED', appointment: { clientProfileId: clientProfile.id } },
      include: { appointment: true, review: true },
    });
    if (!consultation) return notFound('Completed consultation not found');
    if (consultation.review) return err('Review already submitted');

    const review = await prisma.review.create({
      data: { consultationId, clientProfileId: clientProfile.id, lawyerProfileId: consultation.lawyerProfileId, rating, title, body },
    });

    const stats = await prisma.review.aggregate({
      where: { lawyerProfileId: consultation.lawyerProfileId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.lawyerProfile.update({
      where: { id: consultation.lawyerProfileId },
      data: { averageRating: stats._avg.rating ?? 0, totalReviews: stats._count.rating },
    });

    return ok(review, 201);
  } catch (e) {
    return handleError(e);
  }
}
