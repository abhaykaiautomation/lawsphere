import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';
import { ok, conflict, handleError } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const {
      firstName, lastName, email, phone,
      barCouncilNumber, barCouncilState,
      yearsOfExperience, city, state,
      practiceAreaSlugs, bio, headline,
    } = await req.json() as {
      firstName: string; lastName: string; email: string; phone?: string;
      barCouncilNumber: string; barCouncilState: string;
      yearsOfExperience: number; city: string; state: string;
      practiceAreaSlugs: string[]; bio?: string; headline?: string;
    };

    // If user typed full name in firstName and left lastName blank/same,
    // auto-split so "Abhay Kumar" → firstName="Abhay" lastName="Kumar"
    let fn = firstName.trim();
    let ln = lastName.trim();
    if (!ln || ln === fn) {
      const parts = fn.split(' ');
      fn = parts[0];
      ln = parts.slice(1).join(' ') || '';
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return conflict('An account with this email already exists');

    const slug = `${firstName}-${lastName}-${uuidv4().slice(0, 6)}`
      .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email, phone,
          role: 'LAWYER',
          status: 'PENDING_VERIFICATION',
          emailVerified: false,
        },
      });

      const profile = await tx.lawyerProfile.create({
        data: {
          userId: newUser.id,
          firstName: fn, lastName: ln, slug, bio, headline,
          barCouncilNumber, barCouncilState,
          yearsOfExperience: Number(yearsOfExperience),
          city, state,
          consultationFee: 0,
          verificationStatus: 'PENDING',
        },
      });

      // Link practice areas
      if (practiceAreaSlugs.length > 0) {
        const areas = await tx.practiceArea.findMany({
          where: { slug: { in: practiceAreaSlugs } },
        });
        await tx.lawyerPracticeArea.createMany({
          data: areas.map((a, i) => ({
            lawyerProfileId: profile.id,
            practiceAreaId: a.id,
            isPrimary: i === 0,
          })),
        });
      }

      return newUser;
    });

    return ok({
      message: 'Application submitted successfully. You will receive login credentials once approved.',
      userId: user.id,
    }, 201);
  } catch (e) {
    return handleError(e);
  }
}
