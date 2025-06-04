import { NextRequest, NextResponse } from 'next/server';
import { generateReport } from '@/lib/openai';
import { ReportFormData } from '@/types';

// Vercel 타임아웃 설정 (최대 60초)
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const data: ReportFormData = await request.json();
    
    // 입력 데이터 검증
    if (!data.titleStructure || !data.audience || !data.content || !data.tone) {
      return NextResponse.json(
        { error: '필수 데이터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    console.log('보고서 생성 시작:', new Date().toISOString());
    
    const result = await generateReport(data);
    
    console.log('보고서 생성 완료:', new Date().toISOString());
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('보고서 생성 API 오류:', error);
    
    // OpenAI API 오류 처리
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('시간')) {
        return NextResponse.json(
          { error: '보고서 생성 시간이 초과되었습니다. 내용을 줄이거나 다시 시도해 주세요.' },
          { status: 408 }
        );
      }
      
      if (error.message.includes('rate limit') || error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'API 사용량 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.' },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: `보고서 생성 중 오류가 발생했습니다: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: '알 수 없는 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 