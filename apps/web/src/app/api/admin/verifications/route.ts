import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, forbidden, handleError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const { role } = getCurrentUser(req);
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') return forbidden();

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') ?? 1);
    const limit = Number(searchParams.get('limit') ?? 10);
    const skip = (page - 1) * limit;

    const [lawyers, total] = await Promise.all([
      prisma.lawyerProfile.findMany({
        where: { verificationStatus: 'PENDING' },
        skip, take: limit,
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { email: true } }, documents: true, practiceAreas: { include: { practiceArea: true } } },
      }),
      prisma.lawyerProfile.count({ where: { verificationStatus: 'PENDING' } }),
    ]);
    return ok({ lawyers, total, page, limit });
  } catch (e) {
    return handleError(e);
  }
}
