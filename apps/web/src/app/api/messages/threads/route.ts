import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, handleError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const { sub, role } = getCurrentUser(req);

    if (role === 'CLIENT') {
      const profile = await prisma.clientProfile.findUnique({ where: { userId: sub } });
      if (!profile) return ok([]);

      const appointments = await prisma.appointment.findMany({
        where: { clientProfileId: profile.id },
        orderBy: { scheduledAt: 'desc' },
        include: {
          lawyerProfile: { select: { id: true, firstName: true, lastName: true, slug: true } },
          case: { select: { title: true } },
          consultation: {
            select: {
              id: true,
              messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { content: true, createdAt: true, senderId: true } },
            },
          },
        },
      });

      const threads = appointments.map(a => ({
        appointmentId: a.id,
        consultationId: a.consultation?.id ?? null,
        otherPartyName: `Adv. ${a.lawyerProfile.firstName} ${a.lawyerProfile.lastName}`,
        otherPartyInitials: `${a.lawyerProfile.firstName[0]}${a.lawyerProfile.lastName[0]}`,
        caseTitle: a.case?.title ?? null,
        scheduledAt: a.scheduledAt,
        lastMessage: a.consultation?.messages[0] ?? null,
        myUserId: sub,
      }));

      return ok(threads);
    }

    if (role === 'LAWYER') {
      const profile = await prisma.lawyerProfile.findUnique({ where: { userId: sub } });
      if (!profile) return ok([]);

      const appointments = await prisma.appointment.findMany({
        where: { lawyerProfileId: profile.id },
        orderBy: { scheduledAt: 'desc' },
        include: {
          clientProfile: { select: { id: true, firstName: true, lastName: true } },
          case: { select: { title: true } },
          consultation: {
            select: {
              id: true,
              messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { content: true, createdAt: true, senderId: true } },
            },
          },
        },
      });

      const threads = appointments.map(a => ({
        appointmentId: a.id,
        consultationId: a.consultation?.id ?? null,
        otherPartyName: `${a.clientProfile.firstName} ${a.clientProfile.lastName}`,
        otherPartyInitials: `${a.clientProfile.firstName[0]}${a.clientProfile.lastName[0]}`,
        caseTitle: a.case?.title ?? null,
        scheduledAt: a.scheduledAt,
        lastMessage: a.consultation?.messages[0] ?? null,
        myUserId: sub,
      }));

      return ok(threads);
    }

    return ok([]);
  } catch (e) {
    return handleError(e);
  }
}
