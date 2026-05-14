import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, handleError } from '@/lib/errors';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    getCurrentUser(req);
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') ?? 1);
    const limit = Number(searchParams.get('limit') ?? 50);
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { consultationId: id, deletedAt: null },
        skip, take: limit,
        orderBy: { createdAt: 'asc' },
        include: { sender: { select: { id: true, avatarUrl: true, role: true } } },
      }),
      prisma.message.count({ where: { consultationId: id, deletedAt: null } }),
    ]);
    return ok({ messages, total, page, limit });
  } catch (e) {
    return handleError(e);
  }
}
