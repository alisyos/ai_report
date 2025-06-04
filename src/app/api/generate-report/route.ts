import { NextRequest, NextResponse } from 'next/server';
import { generateReport } from '@/lib/openai';
import { ReportFormData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const data: ReportFormData = await request.json();
    
    // 입력 데이터 검증
    if (!data.titleStructure || !data.audience || !data.content || !data.tone) {
      return NextResponse.json(
        { error: '모든 필수 필드를 입력해 주세요.' },
        { status: 400 }
      );
    }

    const result = await generateReport(data);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('보고서 생성 API 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '보고서 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
} 