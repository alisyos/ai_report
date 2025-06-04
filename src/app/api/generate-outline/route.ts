import { NextRequest, NextResponse } from 'next/server';
import { generateOutline } from '@/lib/openai';
import { OutlineFormData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const data: OutlineFormData = await request.json();
    
    // 입력 데이터 검증
    if (!data.purpose || !data.topic || !data.audience || !data.content) {
      return NextResponse.json(
        { error: '모든 필수 필드를 입력해 주세요.' },
        { status: 400 }
      );
    }

    const result = await generateOutline(data);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('목차 생성 API 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '목차 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
} 