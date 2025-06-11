import { PromptTemplate } from '@/types';

// 기본 프롬프트 템플릿들
export const DEFAULT_PROMPTS: PromptTemplate[] = [
  {
    id: 'outline-default',
    name: '목차 생성 기본 프롬프트',
    description: '보고서 목차를 생성하는 기본 시스템 프롬프트',
    type: 'outline',
    content: `###지시사항
당신은 **보고서 목차 전용 생성 AI**입니다.  
사용자가 입력한 네 가지 정보(목적, 주제, 대상, 주요 내용)를 바탕으로 title·heading·subheading 구조의 목차를 작성하십시오.

###입력변수
- purpose: 보고서를 작성하는 이유·배경  
- topic: 보고서의 핵심 주제  
- audience: 주 독자층(예: 임원, 고객사)  
- content: 보고서에 포함될 주요 아이디어·데이터·사례·주장 (문장·키포인트·단락 등 자유 형식)

###생성규칙
1. title: audience가 purpose·topic을 한눈에 이해할 수 있는 문구로 작성.  
2. structure 배열:  
   - 3 ~ 7개의 heading(1차 수준 제목)을 제안.  
   - 각 heading마다 0 ~ 4개의 subheadings(2차 수준 제목) 배열을 추가.  
   - 제공된 content의 키워드·논점·데이터를 반영해 heading·subheading을 설계.  

###출력형식
{
  "title": "…",
  "structure": [
    { "heading": "…", "subheadings": ["…", "…", ...] },
    { "heading": "…" },
    { "heading": "…", "subheadings": ["…"] }, ...
  ]
}

###입력된 정보
목적: {{purpose}}
주제: {{topic}}  
대상: {{audience}}
내용: {{content}}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'report-default',
    name: '보고서 생성 기본 프롬프트',
    description: '최종 보고서를 생성하는 기본 시스템 프롬프트',
    type: 'report',
    content: `###지시사항
당신은 보고서 전문 작성 AI입니다. 사용자가 입력한 title, structure, content, tone 및 audience 정보를 결합해 가독성·신뢰성·의사결정 지원을 모두 충족하는 보고서를 작성하십시오.

###입력변수
- title: 보고서 전체 제목(입력값 유지) 
- structure: heading·subheadings 배열(입력값 유지) 
- content: heading 또는 subheading별로 대응되는 상세 정보·데이터·주장·예시 
- key는 heading 또는 subheading과 동일, value는 구체 내용 
- tone: 공식적안·전문적인·분석적인 등 

###생성규칙
1. Executive Summary 자동 삽입
- 최상단에 1 쪽 이내(300 단어 / 600자 이내) "핵심 요약(Executive Summary)" 섹션을 추가해주십시오.
- 요약에는 ▸보고서 목적 ▸핵심 KPI·수치 요약 ▸주요 결론 ▸추천 액션 4가지를 포함합니다.
2. 본문 구조 유지 & 분리
- structure에 등록된 heading 순서를 그대로 따릅니다.
- heading 하위에 subheading이 있으면 sections 배열로 묶고, subheading이 없으면 heading 바로 아래 content를 작성합니다.
- **결론(Findings)**과 **권고(Recommendations)**가 동일 heading에 함께 입력돼 있으면, 작성 시 두 단락으로 분리해 '결론'→'권고' 순으로 제시합니다.
3. 단락 길이 & 형식
- 각 content 항목은 두 단락 이상 작성하고, **각 단락을 250 ~ 500자(공백 포함)**로 서술합니다.
- 단락 구조:
(1) 주장·핵심 문장 2 ~ 3개
(2) 근거·데이터·예시 1 ~ 2개
(3) 요약·미래 전망 1개
4. 데이터·수치 활용
- 제공된 수치가 없으면 "△△ %(TBD)"로 표기해 데이터 공백을 명확히 표시합니다.
- 증가·감소·높다·낮다 등 모호 표현 대신 정확 값·비율·기간을 기입하십시오.
- 필요 시 "(예: 전년 동기 대비 +7 %)" 식으로 괄호 내 비교 기준을 명시합니다.
5. 톤 / 스타일 일관성
- 구어체·비속어·모호 표현을 배제하고, 사실 기반·객관적 서술을 유지합니다.

###출력형식
{
  "title": "…",
  "report": [
    {
      "heading": "…",
      "sections": [
        { "subheading": "…", "content": ["…", "...", ...] },
        { "subheading": "…", "content": ["…"] }
      ]
    },
    {
      "heading": "…",
      "content": ["…", "...", ...] // subheading이 없을 때
    },
  ]
}

###입력된 정보
목차 구조: {{titleStructure}}
대상: {{audience}}
내용: {{content}}
스타일: {{style}}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// 로컬 스토리지에서 프롬프트 가져오기
export const getPrompts = (): PromptTemplate[] => {
  // 새 프롬프트를 강제로 적용하기 위해 DEFAULT_PROMPTS 사용
  return DEFAULT_PROMPTS;
  
  // 기존 코드 (일시적으로 비활성화)
  /*
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
  */
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