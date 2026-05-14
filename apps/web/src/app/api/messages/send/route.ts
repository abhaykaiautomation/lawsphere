import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, handleError } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const { sub } = getCurrentUser(req);
    const { consultationId, content, type } = await req.json();

    const message = await prisma.message.create({
      data: { consultationId, senderId: sub, content, type: type ?? 'TEXT' },
      include: { sender: { select: { id: true, avatarUrl: true, role: true } } },
    });
    return ok(message, 201);
  } catch (e) {
    return handleError(e);
  }
}
