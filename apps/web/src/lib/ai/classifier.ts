import OpenAI from 'openai';
import { LEGAL_CLASSIFIER_SYSTEM_PROMPT } from './prompts';
import { logAiCall } from './log';

export interface ClassificationResult {
  primaryCategory: string;
  secondaryCategories: string[];
  confidence: number;
  reasoning: string;
  legalKeywords: string[];
  entities: {
    parties: string[];
    dates: string[];
    amounts: string[];
    locations: string[];
    organizations: string[];
  };
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const model = process.env.OPENAI_MODEL ?? 'gpt-4o';

export async function classifyLegalCase(description: string, caseId?: string): Promise<ClassificationResult> {
  const start = Date.now();
  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: LEGAL_CLASSIFIER_SYSTEM_PROMPT },
      { role: 'user', content: `Legal issue: ${description}` },
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0]?.message?.content ?? '{}') as ClassificationResult;

  await logAiCall({
    caseId,
    taskType: 'LEGAL_CLASSIFICATION',
    model,
    inputTokens: response.usage?.prompt_tokens,
    outputTokens: response.usage?.completion_tokens,
    latencyMs: Date.now() - start,
    outputData: result,
    confidenceScore: result.confidence,
  });

  return result;
}
