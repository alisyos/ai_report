import OpenAI from 'openai';
import { OutlineFormData, OutlineResponse, ReportFormData, ReportResponse } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateOutline(data: OutlineFormData): Promise<OutlineResponse> {
  const audienceMap = {
    internal_team: '내부 팀',
    executives: '임원',
    general_public: '일반 대중'
  };

  const prompt = `###지시사항
당신은 **보고서 목차 전용 생성 AI**입니다. 
사용자가 입력한 네 가지 정보(목적, 주제, 대상, 주요 내용)를 바탕으로 title·heading·subheading 구조의 목차를 작성하십시오.
응답은 반드시 JSON 형식으로 제공해주세요.

###입력변수
- purpose: 보고서를 작성하는 이유·배경 
- topic: 보고서의 핵심 주제 
- audience: 주 독자층(예: 경영진, 고객사, 학생) 
- content: 보고서에 포함될 주요 아이디어·데이터·사례·주장 (문장·키포인트·단락 등 자유 형식)

###생성규칙
1. title: audience가 purpose·topic을 한눈에 이해할 수 있는 문구로 작성. 
2. structure 배열: 
- 3 ~ 7개의 heading(1차 수준 제목)을 제안. 
- 각 heading마다 0 ~ 4개의 subheadings(2차 수준 제목) 배열을 추가. 
- 제공된 content의 키워드·논점·데이터를 반영해 heading·subheading을 설계. 

###JSON 출력형식
다음과 같은 JSON 구조로 응답해주세요:
{
"title": "…",
"structure": [
{ "heading": "…", "subheadings": ["…", "…", ...] },
{ "heading": "…" },
{ "heading": "…", "subheadings": ["…"] }, ...
]
}

###purpose
${data.purpose}
###topic
${data.topic}
###audience
${audienceMap[data.audience]}
###content
${data.content}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const result = completion.choices[0].message.content;
    if (!result) {
      throw new Error('OpenAI API에서 응답을 받지 못했습니다.');
    }

    return JSON.parse(result) as OutlineResponse;
  } catch (error) {
    console.error('목차 생성 중 오류 발생:', error);
    throw new Error('목차 생성에 실패했습니다. 다시 시도해 주세요.');
  }
}

export async function generateReport(data: ReportFormData): Promise<ReportResponse> {
  const audienceMap = {
    internal_team: '내부 팀',
    executives: '임원',
    general_public: '일반 대중'
  };

  const toneMap = {
    formal: '격식체',
    friendly: '친근한',
    professional: '전문적'
  };

  const prompt = `###지시사항
당신은 보고서 전문 작성 AI입니다. 사용자가 입력한 title, structure, content, tone 및 audience 정보를 결합해 가독성·신뢰성·의사결정 지원을 모두 충족하는 보고서를 작성하십시오.
응답은 반드시 JSON 형식으로 제공해주세요.

###입력변수
- title: 보고서 전체 제목(입력값 유지) 
- structure: heading·subheadings 배열(입력값 유지) 
- content: heading 또는 subheading별로 대응되는 상세 정보·데이터·주장·예시 
- key는 heading 또는 subheading과 동일, value는 구체 내용 
- tone: 공식적·친근함·설득형 등 

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
6. 인용·참고문헌
- 본문 중 외부 자료·조사 결과를 언급할 때는 "(OECD, 2023)" 식 괄호 인용을 사용합니다.
- 보고서 말미에 References heading을 자동 생성하여 APA 7판 형식으로 정렬된 참고문헌 리스트를 나열합니다.
- 내부 문서일 경우 "(사내 재무팀, 2025)"처럼 작성자·부서·연도·문서명(있으면)을 표기하십시오.

###JSON 출력형식
다음과 같은 JSON 구조로 응답해주세요:
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
... (모든 heading 작성 후)
{
"heading": "References",
"content": ["참고문헌 APA 형식 목록 ① …", "② …", ...]
}
]
}

###titleStructure
${JSON.stringify(data.titleStructure)}
###audience
${audienceMap[data.audience]}
###content
${data.content}
###tone
${toneMap[data.tone]}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const result = completion.choices[0].message.content;
    if (!result) {
      throw new Error('OpenAI API에서 응답을 받지 못했습니다.');
    }

    return JSON.parse(result) as ReportResponse;
  } catch (error) {
    console.error('보고서 생성 중 오류 발생:', error);
    throw new Error('보고서 생성에 실패했습니다. 다시 시도해 주세요.');
  }
} 