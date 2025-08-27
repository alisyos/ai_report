'use client';

import React, { useState } from 'react';
import { FileText, BookOpen, Download, RefreshCw, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { OutlineForm } from '@/components/OutlineForm';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { LoadingModal } from '@/components/ui/LoadingModal';
import { OutlineFormData, OutlineResponse, ReportResponse } from '@/types';

type TabType = 'outline' | 'report';

// 스트리밍 응답 처리 함수
const handleStreamingResponse = async (
  response: Response,
  onComplete: (finalResult: string) => void
): Promise<void> => {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let accumulatedContent = '';

  if (!reader) {
    throw new Error('스트리밍 응답을 읽을 수 없습니다.');
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            
            if (data.error) {
              throw new Error(data.error);
            }
            
            if (data.done && data.final) {
              onComplete(data.final);
              return;
            }
            
            if (data.accumulated) {
              accumulatedContent = data.accumulated;
            }
          } catch (parseError) {
            // JSON 파싱 오류는 무시하고 계속 진행
            console.warn('스트리밍 데이터 파싱 오류:', parseError);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
};

export default function Home() {
  const [outlineData, setOutlineData] = useState<OutlineFormData>();
  const [outlineResult, setOutlineResult] = useState<OutlineResponse>();
  const [reportResult, setReportResult] = useState<ReportResponse>();
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('outline');

  const handleOutlineSubmit = async (data: OutlineFormData) => {
    setIsGeneratingOutline(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate-outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '서버 오류가 발생했습니다.' }));
        throw new Error(errorData.error || '목차 생성에 실패했습니다.');
      }

      // 스트리밍 응답 처리
      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        await handleStreamingResponse(response, (finalResult) => {
          const parsed = JSON.parse(finalResult);
          setOutlineData(data);
          setOutlineResult(parsed);
          setActiveTab('outline');
        });
      } else {
        // 기존 JSON 응답 처리 (호환성)
        const result = await response.json();
        setOutlineData(data);
        setOutlineResult(result);
        setActiveTab('outline');
      }
    } catch (error) {
      console.error('목차 생성 오류:', error);
      setError(error instanceof Error ? error.message : '목차 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!outlineResult || !outlineData) return;

    setIsGeneratingReport(true);
    setError(null);
    
    try {
      const reportData = {
        titleStructure: outlineResult,
        audience: outlineData.audience,
        content: outlineData.content,
        tone: outlineData.tone
      };

      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '서버 오류가 발생했습니다.' }));
        throw new Error(errorData.error || '보고서 생성에 실패했습니다.');
      }

      // 스트리밍 응답 처리
      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        await handleStreamingResponse(response, (finalResult) => {
          const parsed = JSON.parse(finalResult);
          setReportResult(parsed);
          setActiveTab('report');
        });
      } else {
        // 기존 JSON 응답 처리 (호환성)
        const result = await response.json();
        setReportResult(result);
        setActiveTab('report');
      }
    } catch (error) {
      console.error('보고서 생성 오류:', error);
      setError(error instanceof Error ? error.message : '보고서 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleStartOver = () => {
    setOutlineData(undefined);
    setOutlineResult(undefined);
    setReportResult(undefined);
    setError(null);
    setActiveTab('outline');
  };

  const handleDownload = () => {
    if (!reportResult) return;

    let content = `${reportResult.title}\n\n`;
    
    reportResult.report.forEach((section, index) => {
      content += `${index + 1}. ${section.heading}\n\n`;
      
      if (section.sections) {
        section.sections.forEach((subsection, subIndex) => {
          content += `${index + 1}.${subIndex + 1} ${subsection.subheading}\n\n`;
          subsection.content.forEach(paragraph => {
            content += `${paragraph}\n\n`;
          });
        });
      } else if (section.content) {
        section.content.forEach(paragraph => {
          content += `${paragraph}\n\n`;
        });
      }
      
      content += '\n';
    });
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportResult.title.replace(/[^a-zA-Z0-9가-힣]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    if (!reportResult) return;

    let content = `${reportResult.title}\n\n`;
    
    reportResult.report.forEach((section, index) => {
      content += `${index + 1}. ${section.heading}\n\n`;
      
      if (section.sections) {
        section.sections.forEach((subsection, subIndex) => {
          content += `${index + 1}.${subIndex + 1} ${subsection.subheading}\n\n`;
          subsection.content.forEach(paragraph => {
            content += `${paragraph}\n\n`;
          });
        });
      } else if (section.content) {
        section.content.forEach(paragraph => {
          content += `${paragraph}\n\n`;
        });
      }
      
      content += '\n';
    });
    
    try {
      await navigator.clipboard.writeText(content);
      alert('보고서가 클립보드에 복사되었습니다.');
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
      alert('클립보드 복사에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 로딩 모달 */}
      <LoadingModal
        isOpen={isGeneratingOutline}
        type="outline"
        title="목차 생성 중"
        message="입력하신 정보를 바탕으로 체계적인 목차를 생성하고 있습니다."
      />
      
      <LoadingModal
        isOpen={isGeneratingReport}
        type="report"
        title="보고서 생성 중"
        message="목차를 바탕으로 완성된 보고서를 작성하고 있습니다."
      />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <div></div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                AI 보고서 생성기
              </h1>
              <p className="text-lg text-gray-600">
                OpenAI를 활용한 전문 보고서 자동 생성 시스템
              </p>
            </div>
            <div>
              <a
                href="/admin"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                관리자
              </a>
            </div>
          </div>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">오류가 발생했습니다</h3>
                <div className="mt-1 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 메인 컨텐츠 - 좌우 분할 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* 좌측: 입력 폼 (2/5) */}
          <div className="lg:col-span-2 space-y-6">
            <OutlineForm 
              onSubmit={handleOutlineSubmit} 
              isLoading={isGeneratingOutline}
            />
          </div>

          {/* 우측: 결과 표시 (3/5) */}
          <div className="lg:col-span-3 space-y-6">
            {/* 탭 헤더 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">결과</h2>
                  {reportResult && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={copyToClipboard}
                        size="sm"
                      >
                        복사
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleDownload}
                        size="sm"
                        className="flex items-center"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        다운로드
                      </Button>
                      <Button
                        onClick={handleStartOver}
                        size="sm"
                        className="flex items-center"
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        새로 시작
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* 탭 네비게이션 */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab('outline')}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'outline'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    목차
                    {outlineResult && (
                      <CheckCircle className="w-4 h-4 ml-2 text-green-500" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('report')}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'report'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    보고서
                    {reportResult && (
                      <CheckCircle className="w-4 h-4 ml-2 text-green-500" />
                    )}
                  </button>
                </div>
              </CardHeader>
            </Card>

            {/* 탭 컨텐츠 */}
            <Card>
              <CardContent className="p-6">
                {activeTab === 'outline' && (
                  <div className="space-y-4">
                    {outlineResult ? (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {outlineResult.title}
                          </h3>
                          <Button
                            onClick={handleGenerateReport}
                            disabled={isGeneratingReport}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            보고서 생성하기
                          </Button>
                        </div>
                        
                        <div className="space-y-3">
                          {outlineResult.structure.map((section, index) => (
                            <div key={index} className="border-l-4 border-blue-500 pl-4">
                              <h4 className="font-medium text-gray-900">
                                {index + 1}. {section.heading}
                              </h4>
                              {section.subheadings && section.subheadings.length > 0 && (
                                <ul className="mt-2 space-y-1">
                                  {section.subheadings.map((sub, subIndex) => (
                                    <li key={subIndex} className="text-sm text-gray-600 ml-4">
                                      {index + 1}.{subIndex + 1} {sub}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          좌측에서 정보를 입력하고 목차를 생성해 주세요.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'report' && (
                  <div className="space-y-4">
                    {reportResult ? (
                      <div className="max-w-none">
                        {/* 제목 */}
                        <div className="text-center mb-8">
                          <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {reportResult.title}
                          </h1>
                          <div className="w-16 h-1 bg-blue-600 mx-auto"></div>
                        </div>

                        {/* 보고서 본문 */}
                        <div className="space-y-6">
                          {reportResult.report.map((section, index) => (
                            <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                                {index + 1}. {section.heading}
                              </h2>
                              
                              {section.sections ? (
                                <div className="space-y-4">
                                  {section.sections.map((subsection, subIndex) => (
                                    <div key={subIndex} className="ml-4">
                                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                                        {index + 1}.{subIndex + 1} {subsection.subheading}
                                      </h3>
                                      <div className="space-y-3">
                                        {subsection.content.map((paragraph, pIndex) => (
                                          <p key={pIndex} className="text-gray-700 leading-relaxed">
                                            {paragraph}
                                          </p>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {section.content?.map((paragraph, pIndex) => (
                                    <p key={pIndex} className="text-gray-700 leading-relaxed">
                                      {paragraph}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          목차를 생성한 후 보고서를 생성해 주세요.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
