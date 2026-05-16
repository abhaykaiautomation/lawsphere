import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { forbidden, handleError } from '@/lib/errors';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are LexBot, an AI legal assistant built into LawSphere — India's AI-powered legal marketplace.

Your role is to:
- Help clients understand their legal situation in plain language
- Explain legal terms, procedures, and rights under Indian law
- Guide them on next steps (gathering documents, filing complaints, finding the right lawyer)
- Reference relevant Indian statutes and landmark cases when appropriate

Rules:
- Always end responses with a brief statutory disclaimer if giving legal guidance
- Keep responses concise (under 250 words unless asked for detail)
- Never give jurisdiction-specific advice without knowing the client's state
- Recommend consulting a verified lawyer for binding legal advice
- Be empathetic — clients are often stressed about their legal situation
- Respond in English unless the client writes in another language`;

export async function POST(req: NextRequest) {
  try {
    const { sub, role } = getCurrentUser(req);
    if (role !== 'CLIENT') return forbidden();

    const { message, caseId } = await req.json() as { message: string; caseId?: string };

    // Build context from user's cases if available
    let caseContext = '';
    if (caseId) {
      const legalCase = await prisma.case.findFirst({
        where: { id: caseId, clientProfile: { userId: sub } },
        select: { title: true, aiClassification: true, aiSummary: true, urgency: true, status: true },
      });
      if (legalCase) {
        caseContext = `\n\nCurrent case context:
- Title: ${legalCase.title}
- Legal area: ${legalCase.aiClassification || 'unknown'}
- Urgency: ${legalCase.urgency}
- Status: ${legalCase.status}
- AI Summary: ${legalCase.aiSummary || 'pending'}`;
      }
    }

    const stream = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o',
      stream: true,
      max_tokens: 400,
      temperature: 0.4,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + caseContext },
        { role: 'user',   content: message },
      ],
    });

    // Stream the response back to the client
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? '';
            if (text) controller.enqueue(encoder.encode(text));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
