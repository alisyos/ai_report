import { NextRequest, NextResponse } from 'next/server';
import { updatePrompt, getPrompts } from '@/lib/prompts';
import { PromptUpdateRequest } from '@/types';

// GET: 특정 프롬프트 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prompts = getPrompts();
    const prompt = prompts.find(p => p.id === params.id);
    
    if (!prompt) {
      return NextResponse.json(
        { error: '프롬프트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(prompt);
  } catch (error) {
    console.error('프롬프트 조회 오류:', error);
    return NextResponse.json(
      { error: '프롬프트를 조회할 수 없습니다.' },
      { status: 500 }
    );
  }
}

// PUT: 프롬프트 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates: PromptUpdateRequest = await request.json();
    
    const success = updatePrompt(params.id, updates);
    
    if (!success) {
      return NextResponse.json(
        { error: '프롬프트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: '프롬프트가 수정되었습니다.' });
  } catch (error) {
    console.error('프롬프트 수정 오류:', error);
    return NextResponse.json(
      { error: '프롬프트를 수정할 수 없습니다.' },
      { status: 500 }
    );
  }
} 