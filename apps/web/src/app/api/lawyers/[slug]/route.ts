import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, notFound, handleError } from '@/lib/errors';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const lawyer = await prisma.lawyerProfile.findUnique({
      where: { slug, deletedAt: null },
      include: {
        user: { select: { email: true, avatarUrl: true } },
        practiceAreas: { include: { practiceArea: true } },
        educations: true,
        experiences: true,
        availability: true,
        reviews: { where: { isPublic: true }, take: 10, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!lawyer) return notFound('Lawyer not found');
    return ok(lawyer);
  } catch (e) {
    return handleError(e);
  }
}
