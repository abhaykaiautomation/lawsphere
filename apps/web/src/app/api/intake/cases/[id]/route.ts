import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, notFound, forbidden, handleError } from '@/lib/errors';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { sub, role } = getCurrentUser(req);

    const legalCase = await prisma.case.findUnique({
      where: { id: params.id },
      include: { practiceArea: true, documents: true, recommendations: { include: { lawyerProfile: true } } },
    });
    if (!legalCase) return notFound('Case not found');

    if (role === 'CLIENT') {
      const clientProfile = await prisma.clientProfile.findUnique({ where: { userId: sub } });
      if (legalCase.clientProfileId !== clientProfile?.id) return forbidden();
    }

    return ok(legalCase);
  } catch (e) {
    return handleError(e);
  }
}
