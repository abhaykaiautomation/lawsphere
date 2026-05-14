import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, handleError } from '@/lib/errors';

export async function PATCH(req: NextRequest) {
  try {
    const { sub } = getCurrentUser(req);
    await prisma.notification.updateMany({
      where: { userId: sub, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return ok({ success: true });
  } catch (e) {
    return handleError(e);
  }
}
