import OpenAI from 'openai';
import { getPromptByType } from './prompts';
import { OutlineFormData, OutlineResponse, ReportFormData, ReportResponse } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateOutline(data: {
  purpose: string;
  topic: string;
  audience: string;
  content: string;
  tone: string;
}) {
  const promptTemplate = getPromptByType('outline');
  const systemPrompt = promptTemplate?.content || `당신은 전문적인 보고서 목차 생성 전문가입니다. 주어진 정보를 바탕으로 구조화된 보고서 목차를 JSON 형식으로 제공해주세요.`;

  const userPrompt = `
보고서 정보:
- 목적: ${data.purpose}
- 주제: ${data.topic}
- 대상: ${data.audience}
- 톤/스타일: ${data.tone}
- 내용: ${data.content}

위 정보를 바탕으로 보고서 목차를 생성해주세요.
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1',
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userPrompt
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI 응답이 비어있습니다.');
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('JSON 파싱 오류:', error);
    throw new Error('응답을 파싱할 수 없습니다.');
  }
}

export async function generateReport(data: {
  titleStructure: any;
  audience: string;
  content: string;
  tone: string;
}) {
  const promptTemplate = getPromptByType('report');
  const systemPrompt = promptTemplate?.content || `당신은 전문적인 보고서 작성 전문가입니다. 주어진 목차 구조와 내용을 바탕으로 완전한 보고서를 JSON 형식으로 작성해주세요.`;

  const userPrompt = `
보고서 목차 구조:
${JSON.stringify(data.titleStructure, null, 2)}

보고서 정보:
- 대상: ${data.audience}
- 톤/스타일: ${data.tone}
- 내용: ${data.content}

위 목차 구조에 따라 완전한 보고서를 작성해주세요.
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1',
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userPrompt
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI 응답이 비어있습니다.');
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('JSON 파싱 오류:', error);
    throw new Error('응답을 파싱할 수 없습니다.');
  }
} 