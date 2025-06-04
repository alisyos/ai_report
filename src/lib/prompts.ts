import { PromptTemplate } from '@/types';

// 기본 프롬프트 템플릿들
export const DEFAULT_PROMPTS: PromptTemplate[] = [
  {
    id: 'outline-default',
    name: '목차 생성 기본 프롬프트',
    description: '보고서 목차를 생성하는 기본 시스템 프롬프트',
    type: 'outline',
    content: `당신은 전문적인 보고서 목차 생성 전문가입니다. 주어진 정보를 바탕으로 구조화된 보고서 목차를 생성해주세요.

다음 규칙을 따라주세요:
1. 보고서의 목적과 주제에 맞는 논리적인 구조를 만들어주세요
2. 대상 독자(내부 팀/임원/일반 대중)를 고려하여 적절한 수준으로 작성해주세요
3. Executive Summary를 첫 번째 항목으로 포함해주세요
4. 결론 및 권고사항을 마지막 항목으로 포함해주세요
5. 참고문헌 항목을 추가해주세요
6. 각 주요 섹션에는 2-4개의 하위 항목을 포함해주세요

응답은 반드시 다음 JSON 형식으로 제공해주세요:
{
  "title": "보고서 제목",
  "structure": [
    {
      "heading": "주요 섹션 제목",
      "subheadings": ["하위 항목1", "하위 항목2"]
    }
  ]
}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'report-default',
    name: '보고서 생성 기본 프롬프트',
    description: '최종 보고서를 생성하는 기본 시스템 프롬프트',
    type: 'report',
    content: `당신은 전문적인 보고서 작성 전문가입니다. 주어진 목차 구조와 내용을 바탕으로 완전한 보고서를 작성해주세요.

다음 규칙을 따라주세요:
1. 각 섹션은 목차 구조에 따라 체계적으로 작성해주세요
2. 각 단락은 250-500자로 구성해주세요
3. 전문적이고 명확한 문체를 사용해주세요
4. 데이터나 구체적인 정보가 없는 경우 "TBD(To Be Determined)"로 표시해주세요
5. 대상 독자와 톤/스타일을 고려하여 적절한 수준으로 작성해주세요
6. Executive Summary는 전체 보고서의 핵심 내용을 요약해주세요
7. 결론에는 구체적인 권고사항을 포함해주세요

응답은 반드시 다음 JSON 형식으로 제공해주세요:
{
  "title": "보고서 제목",
  "report": [
    {
      "heading": "섹션 제목",
      "sections": [
        {
          "subheading": "하위 섹션 제목",
          "content": ["단락1", "단락2"]
        }
      ]
    }
  ]
}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// 로컬 스토리지에서 프롬프트 가져오기
export const getPrompts = (): PromptTemplate[] => {
  if (typeof window === 'undefined') return DEFAULT_PROMPTS;
  
  const stored = localStorage.getItem('ai-report-prompts');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('프롬프트 파싱 오류:', error);
    }
  }
  return DEFAULT_PROMPTS;
};

// 로컬 스토리지에 프롬프트 저장
export const savePrompts = (prompts: PromptTemplate[]): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('ai-report-prompts', JSON.stringify(prompts));
};

// 특정 타입의 프롬프트 가져오기
export const getPromptByType = (type: 'outline' | 'report'): PromptTemplate | null => {
  const prompts = getPrompts();
  return prompts.find(p => p.type === type) || null;
};

// 프롬프트 업데이트
export const updatePrompt = (id: string, updates: Partial<PromptTemplate>): boolean => {
  const prompts = getPrompts();
  const index = prompts.findIndex(p => p.id === id);
  
  if (index === -1) return false;
  
  prompts[index] = {
    ...prompts[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  savePrompts(prompts);
  return true;
};

// 프롬프트 초기화
export const resetPrompts = (): void => {
  savePrompts(DEFAULT_PROMPTS);
}; 