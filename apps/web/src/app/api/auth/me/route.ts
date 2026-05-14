import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, handleError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const { sub } = getCurrentUser(req);
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: sub },
      include: {
        clientProfile: true,
        lawyerProfile: { include: { practiceAreas: { include: { practiceArea: true } } } },
      },
    });
    return ok(user);
  } catch (e) {
    return handleError(e);
  }
}
