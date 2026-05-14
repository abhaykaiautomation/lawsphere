import { AiTaskType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function logAiCall(params: {
  caseId?: string;
  taskType: AiTaskType;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  latencyMs?: number;
  inputData?: unknown;
  outputData?: unknown;
  confidenceScore?: number;
  error?: string;
}) {
  return prisma.aiLog.create({
    data: {
      caseId: params.caseId,
      taskType: params.taskType,
      model: params.model,
      inputTokens: params.inputTokens ?? 0,
      outputTokens: params.outputTokens ?? 0,
      latencyMs: params.latencyMs,
      inputData: params.inputData as never,
      outputData: params.outputData as never,
      confidenceScore: params.confidenceScore,
      error: params.error,
    },
  });
}
