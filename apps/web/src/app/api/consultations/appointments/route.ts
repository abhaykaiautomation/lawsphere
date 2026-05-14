import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, notFound, err, handleError } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const { sub } = getCurrentUser(req);
    const { lawyerProfileId, caseId, scheduledAt, durationMin, mode, clientNotes } = await req.json();

    const clientProfile = await prisma.clientProfile.findUnique({ where: { userId: sub } });
    if (!clientProfile) return notFound('Client profile not found');

    const lawyer = await prisma.lawyerProfile.findFirst({
      where: { id: lawyerProfileId, verificationStatus: 'VERIFIED', deletedAt: null },
    });
    if (!lawyer) return notFound('Lawyer not found');

    const scheduled = new Date(scheduledAt);
    if (scheduled <= new Date()) return err('Appointment must be in the future');

    const conflict = await prisma.appointment.findFirst({
      where: {
        lawyerProfileId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        scheduledAt: {
          gte: new Date(scheduled.getTime() - durationMin * 60000),
          lte: new Date(scheduled.getTime() + durationMin * 60000),
        },
      },
    });
    if (conflict) return err('Lawyer is not available at this time');

    const appointment = await prisma.appointment.create({
      data: {
        appointmentNumber: `APT-${Date.now()}`,
        clientProfileId: clientProfile.id,
        lawyerProfileId,
        caseId,
        scheduledAt: scheduled,
        durationMin: durationMin ?? 30,
        mode: mode ?? 'VIDEO',
        status: 'PENDING',
        clientNotes,
      },
      include: { lawyerProfile: { select: { firstName: true, lastName: true } } },
    });

    return ok(appointment, 201);
  } catch (e) {
    return handleError(e);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { sub, role } = getCurrentUser(req);
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') ?? 1);
    const limit = Number(searchParams.get('limit') ?? 10);
    const skip = (page - 1) * limit;

    if (role === 'CLIENT') {
      const clientProfile = await prisma.clientProfile.findUnique({ where: { userId: sub } });
      if (!clientProfile) return notFound('Client profile not found');
      const appointments = await prisma.appointment.findMany({
        where: { clientProfileId: clientProfile.id },
        skip, take: limit,
        orderBy: { scheduledAt: 'desc' },
        include: { lawyerProfile: { select: { firstName: true, lastName: true, slug: true } }, consultation: true, payment: true },
      });
      return ok(appointments);
    }

    const lawyerProfile = await prisma.lawyerProfile.findUnique({ where: { userId: sub } });
    if (!lawyerProfile) return notFound('Lawyer profile not found');
    const appointments = await prisma.appointment.findMany({
      where: { lawyerProfileId: lawyerProfile.id },
      skip, take: limit,
      orderBy: { scheduledAt: 'asc' },
      include: { clientProfile: { select: { firstName: true, lastName: true } }, consultation: true },
    });
    return ok(appointments);
  } catch (e) {
    return handleError(e);
  }
}
