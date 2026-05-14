import OpenAI from 'openai';
import { URGENCY_DETECTOR_PROMPT } from './prompts';
import { logAiCall } from './log';

export interface UrgencyResult {
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  score: number;
  reasoning: string;
  timeConstraints: string[];
  riskFactors: string[];
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const model = process.env.OPENAI_MODEL ?? 'gpt-4o';

export async function detectUrgency(description: string, caseId?: string): Promise<UrgencyResult> {
  const start = Date.now();
  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: URGENCY_DETECTOR_PROMPT },
      { role: 'user', content: description },
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0]?.message?.content ?? '{}') as UrgencyResult;

  await logAiCall({
    caseId,
    taskType: 'URGENCY_SCORING',
    model,
    inputTokens: response.usage?.prompt_tokens,
    outputTokens: response.usage?.completion_tokens,
    latencyMs: Date.now() - start,
    outputData: result,
    confidenceScore: result.score,
  });

  return result;
}
