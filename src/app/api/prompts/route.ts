import { NextRequest, NextResponse } from 'next/server';
import { getPrompts, savePrompts, updatePrompt, resetPrompts, DEFAULT_PROMPTS } from '@/lib/prompts';
import { PromptTemplate, PromptUpdateRequest } from '@/types';

// GET: 모든 프롬프트 조회
export async function GET() {
  try {
    const prompts = getPrompts();
    return NextResponse.json(prompts);
  } catch (error) {
    console.error('프롬프트 조회 오류:', error);
    return NextResponse.json(
      { error: '프롬프트를 조회할 수 없습니다.' },
      { status: 500 }
    );
  }
}

// POST: 프롬프트 초기화
export async function POST() {
  try {
    resetPrompts();
    return NextResponse.json({ message: '프롬프트가 초기화되었습니다.' });
  } catch (error) {
    console.error('프롬프트 초기화 오류:', error);
    return NextResponse.json(
      { error: '프롬프트를 초기화할 수 없습니다.' },
      { status: 500 }
    );
  }
} 