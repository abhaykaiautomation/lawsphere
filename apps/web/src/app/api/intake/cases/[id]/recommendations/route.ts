import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, notFound, forbidden, handleError } from '@/lib/errors';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { sub, role } = getCurrentUser(req);

    const legalCase = await prisma.case.findUnique({ where: { id: params.id } });
    if (!legalCase) return notFound('Case not found');

    if (role === 'CLIENT') {
      const clientProfile = await prisma.clientProfile.findUnique({ where: { userId: sub } });
      if (legalCase.clientProfileId !== clientProfile?.id) return forbidden();
    }

    const recommendations = await prisma.aiRecommendation.findMany({
      where: { caseId: params.id },
      orderBy: { rank: 'asc' },
      include: {
        lawyerProfile: {
          include: {
            user: { select: { avatarUrl: true } },
            practiceAreas: { include: { practiceArea: true } },
          },
        },
      },
    });

    return ok(recommendations);
  } catch (e) {
    return handleError(e);
  }
}
