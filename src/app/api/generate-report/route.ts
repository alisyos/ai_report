import { NextRequest, NextResponse } from 'next/server';
import { generateReportStream } from '@/lib/openai';
import { ReportFormData } from '@/types';

export const maxDuration = 300; // 5분으로 증가 (스트리밍용)

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

    console.log('보고서 생성 스트리밍 시작:', new Date().toISOString());

    // 스트리밍 응답 생성
    const stream = new ReadableStream({
      async start(controller) {
        let accumulatedContent = '';
        
        try {
          for await (const chunk of generateReportStream(data)) {
            accumulatedContent += chunk;
            
            // 클라이언트에 청크 전송
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ chunk, accumulated: accumulatedContent })}\n\n`)
            );
          }
          
          // 스트림 종료 신호
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ done: true, final: accumulatedContent })}\n\n`)
          );
          
          console.log('보고서 생성 스트리밍 완료:', new Date().toISOString());
          controller.close();
          
        } catch (error) {
          console.error('보고서 생성 스트리밍 오류:', error);
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' })}\n\n`)
          );
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error) {
    console.error('보고서 생성 API 초기화 오류:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 