import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, notFound, handleError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const { sub } = getCurrentUser(req);
    const lawyer = await prisma.lawyerProfile.findUnique({
      where: { userId: sub, deletedAt: null },
      include: { practiceAreas: { include: { practiceArea: true } }, educations: true, experiences: true, availability: true },
    });
    if (!lawyer) return notFound('Lawyer profile not found');
    return ok(lawyer);
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { sub } = getCurrentUser(req);
    const body = await req.json();
    const { availability, ...profileData } = body;

    const lawyer = await prisma.lawyerProfile.findUnique({ where: { userId: sub, deletedAt: null } });
    if (!lawyer) return notFound('Lawyer profile not found');

    const updated = await prisma.lawyerProfile.update({ where: { id: lawyer.id }, data: profileData });

    if (availability) {
      await prisma.$transaction(async (tx) => {
        await tx.lawyerAvailability.deleteMany({ where: { lawyerProfileId: lawyer.id } });
        await tx.lawyerAvailability.createMany({ data: availability.map((s: object) => ({ ...s, lawyerProfileId: lawyer.id })) });
      });
    }

    const isComplete = Boolean(updated.bio && updated.headline && updated.city && updated.consultationFee);
    if (isComplete !== updated.isProfileComplete) {
      await prisma.lawyerProfile.update({ where: { id: lawyer.id }, data: { isProfileComplete: isComplete } });
    }

    const final = await prisma.lawyerProfile.findUnique({
      where: { id: lawyer.id },
      include: { practiceAreas: { include: { practiceArea: true } }, educations: true, experiences: true, availability: true },
    });
    return ok(final);
  } catch (e) {
    return handleError(e);
  }
}
