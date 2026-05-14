import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ok, notFound, handleError } from '@/lib/errors';
import { classifyLegalCase } from '@/lib/ai/classifier';
import { detectUrgency } from '@/lib/ai/urgency';
import { summarizeIntake } from '@/lib/ai/summarizer';
import { recommendLawyers } from '@/lib/ai/recommender';

export async function POST(req: NextRequest) {
  try {
    const { sub } = getCurrentUser(req);
    const { title, description, desiredOutcome, preferredLocation, preferredLanguages } = await req.json();

    const clientProfile = await prisma.clientProfile.findUnique({ where: { userId: sub } });
    if (!clientProfile) return notFound('Client profile not found');

    const caseNumber = `CASE-${Date.now()}`;
    const legalCase = await prisma.case.create({
      data: {
        caseNumber, title, description,
        desiredOutcome, preferredLocation,
        preferredLanguages: preferredLanguages ?? ['en'],
        status: 'DRAFT',
        clientProfile: { connect: { id: clientProfile.id } },
      },
    });

    // Run AI pipeline asynchronously
    runAiPipeline(legalCase.id, description, clientProfile).catch(console.error);

    return ok(legalCase, 201);
  } catch (e) {
    return handleError(e);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { sub } = getCurrentUser(req);
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') ?? 1);
    const limit = Number(searchParams.get('limit') ?? 10);

    const clientProfile = await prisma.clientProfile.findUnique({ where: { userId: sub } });
    if (!clientProfile) return notFound('Client profile not found');

    const skip = (page - 1) * limit;
    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where: { clientProfileId: clientProfile.id, deletedAt: null },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { practiceArea: true },
      }),
      prisma.case.count({ where: { clientProfileId: clientProfile.id, deletedAt: null } }),
    ]);

    return ok({ cases, total, page, limit });
  } catch (e) {
    return handleError(e);
  }
}

async function runAiPipeline(caseId: string, description: string, clientProfile: { id: string; city: string | null }) {
  try {
    const [classification, urgency, summary] = await Promise.all([
      classifyLegalCase(description, caseId),
      detectUrgency(description, caseId),
      summarizeIntake(description, caseId),
    ]);

    const practiceArea = await prisma.practiceArea.findUnique({ where: { slug: classification.primaryCategory } });

    await prisma.case.update({
      where: { id: caseId },
      data: {
        status: 'SUBMITTED',
        aiClassification: classification.primaryCategory,
        aiConfidenceScore: classification.confidence,
        aiUrgencyScore: urgency.score,
        aiSummary: summary.summary,
        aiExtractedEntities: classification.entities as never,
        urgency: urgency.urgency,
        ...(practiceArea && { practiceArea: { connect: { id: practiceArea.id } } }),
      },
    });

    if (practiceArea) {
      await recommendLawyers({
        caseId,
        practiceAreaSlug: practiceArea.slug,
        location: clientProfile.city ?? undefined,
        urgency: urgency.urgency,
      });
      await prisma.case.update({ where: { id: caseId }, data: { status: 'MATCHED' } });
    }
  } catch {
    await prisma.case.update({ where: { id: caseId }, data: { status: 'SUBMITTED' } });
  }
}
