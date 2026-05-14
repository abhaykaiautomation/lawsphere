import OpenAI from 'openai';
import { INTAKE_SUMMARIZER_PROMPT } from './prompts';
import { logAiCall } from './log';

export interface IntakeSummary {
  summary: string;
  coreIssue: string;
  desiredOutcome: string;
  keyFacts: string[];
  recommendedActions: string[];
  estimatedComplexity: 'simple' | 'moderate' | 'complex';
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const model = process.env.OPENAI_MODEL ?? 'gpt-4o';

export async function summarizeIntake(description: string, caseId?: string): Promise<IntakeSummary> {
  const start = Date.now();
  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: INTAKE_SUMMARIZER_PROMPT },
      { role: 'user', content: description },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0]?.message?.content ?? '{}') as IntakeSummary;

  await logAiCall({
    caseId,
    taskType: 'INTAKE_SUMMARIZATION',
    model,
    inputTokens: response.usage?.prompt_tokens,
    outputTokens: response.usage?.completion_tokens,
    latencyMs: Date.now() - start,
    outputData: result,
  });

  return result;
}
