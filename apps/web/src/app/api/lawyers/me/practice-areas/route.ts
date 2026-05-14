import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, notFound, handleError } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const { sub } = getCurrentUser(req);
    const { practiceAreaId, isPrimary } = await req.json() as { practiceAreaId: string; isPrimary: boolean };

    const lawyer = await prisma.lawyerProfile.findUnique({ where: { userId: sub, deletedAt: null } });
    if (!lawyer) return notFound('Lawyer profile not found');

    const area = await prisma.practiceArea.findUnique({ where: { id: practiceAreaId } });
    if (!area) return notFound('Practice area not found');

    const result = await prisma.lawyerPracticeArea.upsert({
      where: { lawyerProfileId_practiceAreaId: { lawyerProfileId: lawyer.id, practiceAreaId } },
      update: { isPrimary },
      create: { lawyerProfileId: lawyer.id, practiceAreaId, isPrimary },
    });

    return ok(result, 201);
  } catch (e) {
    return handleError(e);
  }
}
