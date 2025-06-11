'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardHeader, CardContent } from './ui/Card';
import { OutlineFormData } from '@/types';

const outlineSchema = z.object({
  purpose: z.string().min(1, '목적을 입력해 주세요.'),
  topic: z.string().min(1, '주제를 입력해 주세요.'),
  audience: z.enum(['internal_team', 'executives', 'clients', 'general_public'], {
    required_error: '대상을 선택해 주세요.'
  }),
  content: z.string().min(1, '내용을 입력해 주세요.'),
  contentType: z.enum(['text', 'file']).default('text'),
  tone: z.enum(['formal', 'professional', 'analytical', 'explanatory'], {
    required_error: '문장 스타일을 선택해 주세요.'
  })
});

interface OutlineFormProps {
  onSubmit: (data: OutlineFormData) => void;
  isLoading: boolean;
}

export const OutlineForm: React.FC<OutlineFormProps> = ({ onSubmit, isLoading }) => {
  const [contentType, setContentType] = useState<'text' | 'file'>('text');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [fileError, setFileError] = useState<string>('');
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<OutlineFormData>({
    resolver: zodResolver(outlineSchema),
    defaultValues: {
      contentType: 'text'
    }
  });

  const contentValue = watch('content');

  // 파일 타입 검증
  const isValidFileType = (file: File): boolean => {
    const validTypes = [
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const validExtensions = ['.txt', '.doc', '.docx'];
    
    return validTypes.includes(file.type) || 
           validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  };

  // 파일 크기 검증 (10MB)
  const isValidFileSize = (file: File): boolean => {
    return file.size <= 10 * 1024 * 1024;
  };

  // 텍스트 파일인지 확인
  const isTextFile = (file: File): boolean => {
    return file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileError('');

    // 파일 타입 검증
    if (!isValidFileType(file)) {
      setFileError('지원하지 않는 파일 형식입니다. TXT, DOC, DOCX 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 검증
    if (!isValidFileSize(file)) {
      setFileError('파일 크기가 너무 큽니다. 10MB 이하의 파일만 업로드 가능합니다.');
      return;
    }

    setUploadedFile(file);

    // 텍스트 파일만 미리보기 제공
    if (isTextFile(file)) {
      try {
        const content = await readTextFile(file);
        setFileContent(content);
        setValue('content', content);
      } catch (error) {
        console.error('파일 읽기 오류:', error);
        setFileError('파일을 읽는 중 오류가 발생했습니다. 파일이 손상되었거나 인코딩에 문제가 있을 수 있습니다.');
      }
    } else {
      // DOC, DOCX 파일의 경우 파일명만 표시하고 내용은 서버에서 처리하도록 안내
      setFileContent('');
      setValue('content', `[파일 업로드됨: ${file.name}]\n\n이 파일의 내용은 목차 생성 시 자동으로 처리됩니다. DOC/DOCX 파일의 경우 텍스트 내용이 추출되어 사용됩니다.`);
    }
  };

  // 다양한 인코딩으로 텍스트 파일 읽기 시도
  const readTextFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          // 기본적인 텍스트 검증
          if (isValidText(result)) {
            resolve(result);
          } else {
            // UTF-8로 다시 시도
            readWithEncoding(file, 'UTF-8')
              .then(resolve)
              .catch(() => {
                // EUC-KR로 시도
                readWithEncoding(file, 'EUC-KR')
                  .then(resolve)
                  .catch(() => reject(new Error('지원하지 않는 인코딩입니다.')));
              });
          }
        } else {
          reject(new Error('파일 내용을 읽을 수 없습니다.'));
        }
      };
      
      reader.onerror = () => reject(new Error('파일 읽기에 실패했습니다.'));
      reader.readAsText(file, 'UTF-8');
    });
  };

  // 특정 인코딩으로 파일 읽기
  const readWithEncoding = (file: File, encoding: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result && isValidText(result)) {
          resolve(result);
        } else {
          reject(new Error(`${encoding} 인코딩으로 읽기 실패`));
        }
      };
      reader.onerror = () => reject(new Error('파일 읽기 실패'));
      reader.readAsText(file, encoding);
    });
  };

  // 텍스트 유효성 검사 (바이너리 데이터 감지)
  const isValidText = (text: string): boolean => {
    // 제어 문자 비율 확인 (일반적인 제어 문자 제외)
    const controlChars = text.match(/[\x00-\x08\x0E-\x1F\x7F]/g);
    const controlCharRatio = controlChars ? controlChars.length / text.length : 0;
    
    // 제어 문자가 5% 이상이면 바이너리로 판단
    return controlCharRatio < 0.05;
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFileContent('');
    setFileError('');
    setValue('content', '');
    // 파일 input 초기화
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleContentTypeChange = (type: 'text' | 'file') => {
    setContentType(type);
    if (type === 'text') {
      setUploadedFile(null);
      setFileContent('');
      setFileError('');
      setValue('content', '');
    }
  };

  const audienceOptions = [
    { value: 'internal_team', label: '내부 팀' },
    { value: 'executives', label: '임원' },
    { value: 'clients', label: '고객사' },
    { value: 'general_public', label: '일반 대중' }
  ];

  const toneOptions = [
    { value: 'formal', label: '공식적인' },
    { value: 'professional', label: '전문적인' },
    { value: 'analytical', label: '분석적인' },
    { value: 'explanatory', label: '설명중심' }
  ];

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-900">보고서 정보 입력</h2>
        <p className="text-sm text-gray-600 mt-1">
          보고서 생성에 필요한 모든 정보를 입력해 주세요.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 목적 */}
          <div>
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
              목적 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="purpose"
              {...register('purpose')}
              placeholder={"보고서 작성 목적을 입력해주세요.\nex: 고객사 영업을 위해, 분기 실적 정리 및 전략 수립 참고용"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-sm"
              rows={3}
            />
            {errors.purpose && (
              <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>
            )}
          </div>

          {/* 주제 */}
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
              주제 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="topic"
              {...register('topic')}
              placeholder={"보고서의 주제를 입력해주세요.\nex: 2025년 1분기 주요 실적 요약, AI 실무 교육 프로그램 구성안"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-sm"
              rows={3}
            />
            {errors.topic && (
              <p className="mt-1 text-sm text-red-600">{errors.topic.message}</p>
            )}
          </div>

          {/* 대상 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              대상 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {audienceOptions.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    {...register('audience')}
                    value={option.value}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
            {errors.audience && (
              <p className="mt-1 text-sm text-red-600">{errors.audience.message}</p>
            )}
          </div>

          {/* 문장 스타일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              문장 스타일 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {toneOptions.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    {...register('tone')}
                    value={option.value}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
            {errors.tone && (
              <p className="mt-1 text-sm text-red-600">{errors.tone.message}</p>
            )}
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              내용 <span className="text-red-500">*</span>
            </label>
            
            {/* 입력 방식 선택 */}
            <div className="flex space-x-4 mb-3">
              <button
                type="button"
                onClick={() => handleContentTypeChange('text')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  contentType === 'text'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                <FileText className="w-4 h-4 mr-2" />
                직접 입력
              </button>
              <button
                type="button"
                onClick={() => handleContentTypeChange('file')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  contentType === 'file'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                <Upload className="w-4 h-4 mr-2" />
                파일 업로드
              </button>
            </div>

            {contentType === 'text' ? (
              <textarea
                {...register('content')}
                placeholder="보고서에 포함될 상세 내용을 입력해 주세요. 각 목차별 내용을 구분하여 작성하시면 더 정확한 보고서가 생성됩니다."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={8}
              />
            ) : (
              <div className="space-y-3">
                {/* 파일 업로드 영역 */}
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 hover:border-gray-400 transition-colors">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900 hover:text-blue-600">
                          파일을 선택하거나 여기에 드래그하세요
                        </span>
                        <input
                          id="file-upload"
                          type="file"
                          accept=".txt,.doc,.docx"
                          onChange={handleFileUpload}
                          className="sr-only"
                        />
                      </label>
                      <p className="mt-1 text-xs text-gray-500">
                        TXT, DOC, DOCX 파일만 지원됩니다 (최대 10MB)
                      </p>
                    </div>
                  </div>
                </div>

                {/* 파일 오류 메시지 */}
                {fileError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                      <p className="text-sm text-red-800">{fileError}</p>
                    </div>
                  </div>
                )}

                {/* 업로드된 파일 정보 */}
                {uploadedFile && !fileError && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-green-800">
                            {uploadedFile.name}
                          </p>
                          <p className="text-xs text-green-600">
                            {(uploadedFile.size / 1024).toFixed(1)} KB • 업로드 완료
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* 파일 내용 미리보기 (텍스트 파일만) */}
                {fileContent && isTextFile(uploadedFile!) && (
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">파일 내용 미리보기:</h4>
                    <div className="text-xs text-gray-600 max-h-32 overflow-y-auto whitespace-pre-wrap font-mono">
                      {fileContent.substring(0, 500)}
                      {fileContent.length > 500 && '...'}
                    </div>
                  </div>
                )}

                {/* DOC/DOCX 파일 안내 */}
                {uploadedFile && !isTextFile(uploadedFile) && !fileError && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">DOC/DOCX 파일이 업로드되었습니다</p>
                        <p className="text-xs text-blue-600 mt-1">
                          이 파일의 텍스트 내용은 목차 생성 시 자동으로 추출되어 사용됩니다.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          {/* 목차 생성 버튼 */}
          <div className="flex justify-center">
            <Button
              type="submit"
              loading={isLoading}
              size="lg"
              disabled={!contentValue || contentValue.trim().length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  목차 생성 중... (최대 1분 소요)
                </div>
              ) : (
                '목차 생성하기'
              )}
            </Button>
          </div>

          {/* 생성 안내 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">보고서 생성 과정</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 입력된 정보를 바탕으로 목차를 자동 생성합니다</li>
              <li>• 생성된 목차를 검토하고 승인하면 최종 보고서가 작성됩니다</li>
              <li>• Executive Summary와 참고문헌이 자동으로 추가됩니다</li>
              <li>• 각 단락은 250-500자로 구성되며 데이터가 없는 경우 TBD로 표시됩니다</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 