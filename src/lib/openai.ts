import OpenAI from 'openai';
import { OutlineFormData, ReportFormData, OutlineResponse, ReportResponse } from '@/types';
import { getPromptByType } from './prompts';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 50000, // 50초 타임아웃 설정
});

export async function generateOutline(data: OutlineFormData): Promise<OutlineResponse> {
  try {
    const promptTemplate = getPromptByType('outline');
    const promptContent = promptTemplate?.content || `당신은 전문적인 보고서 목차 생성 전문가입니다. 주어진 정보를 바탕으로 구조화된 보고서 목차를 JSON 형식으로 제공해주세요.`;
    
    const prompt = `${promptContent}

보고서 정보:
- 목적: ${data.purpose}
- 주제: ${data.topic}
- 대상: ${data.audience}
- 내용: ${data.content}
- 톤/스타일: ${data.tone}

위 정보를 바탕으로 구조화된 목차를 JSON 형식으로 제공해주세요.`;

    console.log('OpenAI API 호출 시작 (목차):', new Date().toISOString());
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: "당신은 전문적인 보고서 작성 도우미입니다. 주어진 정보를 바탕으로 체계적이고 논리적인 목차를 생성해주세요."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000,
    });

    console.log('OpenAI API 응답 완료 (목차):', new Date().toISOString());

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI API에서 응답을 받지 못했습니다.');
    }

    try {
      const result = JSON.parse(content);
      return result;
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      console.error('원본 응답:', content);
      throw new Error('AI 응답을 파싱하는데 실패했습니다.');
    }
  } catch (error) {
    console.error('목차 생성 오류:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new Error('목차 생성 시간이 초과되었습니다. 다시 시도해 주세요.');
      }
      if (error.message.includes('rate_limit')) {
        throw new Error('API 사용량 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.');
      }
      throw error;
    }
    
    throw new Error('목차 생성 중 알 수 없는 오류가 발생했습니다.');
  }
}

export async function generateReport(data: ReportFormData): Promise<ReportResponse> {
  try {
    const promptTemplate = getPromptByType('report');
    const promptContent = promptTemplate?.content || `당신은 전문적인 보고서 작성 전문가입니다. 주어진 목차 구조와 내용을 바탕으로 완전한 보고서를 JSON 형식으로 작성해주세요.`;
    
    const prompt = `${promptContent}

보고서 정보:
- 목차 구조: ${JSON.stringify(data.titleStructure, null, 2)}
- 대상: ${data.audience}
- 내용: ${data.content}
- 톤/스타일: ${data.tone}

위 정보를 바탕으로 완성된 보고서를 JSON 형식으로 작성해주세요.`;

    console.log('OpenAI API 호출 시작 (보고서):', new Date().toISOString());

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: "당신은 전문적인 보고서 작성자입니다. 주어진 목차와 정보를 바탕으로 완성도 높은 보고서를 JSON 형식으로 작성해주세요."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000,
    });

    console.log('OpenAI API 응답 완료 (보고서):', new Date().toISOString());

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI API에서 응답을 받지 못했습니다.');
    }

    try {
      const result = JSON.parse(content);
      return result;
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      console.error('원본 응답:', content);
      throw new Error('AI 응답을 파싱하는데 실패했습니다.');
    }
  } catch (error) {
    console.error('보고서 생성 오류:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new Error('보고서 생성 시간이 초과되었습니다. 내용을 줄이거나 다시 시도해 주세요.');
      }
      if (error.message.includes('rate_limit')) {
        throw new Error('API 사용량 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.');
      }
      throw error;
    }
    
    throw new Error('보고서 생성 중 알 수 없는 오류가 발생했습니다.');
  }
} 