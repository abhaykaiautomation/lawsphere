import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, handleError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const { sub } = getCurrentUser(req);
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') ?? 1);
    const limit = Number(searchParams.get('limit') ?? 10);
    const skip = (page - 1) * limit;

    const payments = await prisma.payment.findMany({
      where: { clientId: sub },
      skip, take: limit,
      orderBy: { createdAt: 'desc' },
      include: { appointment: true, invoice: true },
    });
    return ok(payments);
  } catch (e) {
    return handleError(e);
  }
}
