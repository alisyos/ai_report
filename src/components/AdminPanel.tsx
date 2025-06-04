'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, RotateCcw, Edit, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardHeader, CardContent } from './ui/Card';
import { PromptTemplate } from '@/types';

const promptSchema = z.object({
  name: z.string().min(1, '이름을 입력해 주세요.'),
  description: z.string().min(1, '설명을 입력해 주세요.'),
  content: z.string().min(1, '프롬프트 내용을 입력해 주세요.')
});

type PromptFormData = z.infer<typeof promptSchema>;

export const AdminPanel: React.FC = () => {
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showContent, setShowContent] = useState<{ [key: string]: boolean }>({});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<PromptFormData>({
    resolver: zodResolver(promptSchema)
  });

  // 프롬프트 목록 로드
  const loadPrompts = async () => {
    try {
      const response = await fetch('/api/prompts');
      if (response.ok) {
        const data = await response.json();
        setPrompts(data);
      }
    } catch (error) {
      console.error('프롬프트 로드 오류:', error);
      showMessage('error', '프롬프트를 불러올 수 없습니다.');
    }
  };

  // 메시지 표시
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // 프롬프트 선택
  const selectPrompt = (prompt: PromptTemplate) => {
    setSelectedPrompt(prompt);
    reset({
      name: prompt.name,
      description: prompt.description,
      content: prompt.content
    });
    setIsEditing(false);
  };

  // 프롬프트 수정
  const onSubmit = async (data: PromptFormData) => {
    if (!selectedPrompt) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/prompts/${selectedPrompt.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        showMessage('success', '프롬프트가 수정되었습니다.');
        setIsEditing(false);
        loadPrompts();
        
        // 선택된 프롬프트 업데이트
        setSelectedPrompt({
          ...selectedPrompt,
          ...data,
          updatedAt: new Date().toISOString()
        });
      } else {
        showMessage('error', '프롬프트 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('프롬프트 수정 오류:', error);
      showMessage('error', '프롬프트 수정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 프롬프트 초기화
  const resetPrompts = async () => {
    if (!confirm('모든 프롬프트를 기본값으로 초기화하시겠습니까?')) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST'
      });

      if (response.ok) {
        showMessage('success', '프롬프트가 초기화되었습니다.');
        loadPrompts();
        setSelectedPrompt(null);
        reset();
      } else {
        showMessage('error', '프롬프트 초기화에 실패했습니다.');
      }
    } catch (error) {
      console.error('프롬프트 초기화 오류:', error);
      showMessage('error', '프롬프트 초기화 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 프롬프트 내용 토글
  const toggleContent = (promptId: string) => {
    setShowContent(prev => ({
      ...prev,
      [promptId]: !prev[promptId]
    }));
  };

  useEffect(() => {
    loadPrompts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            프롬프트 관리자 패널
          </h1>
          <p className="text-lg text-gray-600">
            AI 보고서 생성에 사용되는 시스템 프롬프트를 관리합니다
          </p>
        </div>

        {/* 메시지 */}
        {message && (
          <div className={`mb-6 p-4 rounded-md flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            )}
            <span className={`text-sm ${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {message.text}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 좌측: 프롬프트 목록 */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">프롬프트 목록</h2>
                  <Button
                    onClick={resetPrompts}
                    variant="outline"
                    size="sm"
                    loading={isLoading}
                    className="flex items-center"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    초기화
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {prompts.map((prompt) => (
                    <div
                      key={prompt.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPrompt?.id === prompt.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => selectPrompt(prompt)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{prompt.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          prompt.type === 'outline'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {prompt.type === 'outline' ? '목차' : '보고서'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{prompt.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          수정: {new Date(prompt.updatedAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleContent(prompt.id);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showContent[prompt.id] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      
                      {showContent[prompt.id] && (
                        <div className="mt-3 p-2 bg-gray-100 rounded text-xs text-gray-700 max-h-32 overflow-y-auto">
                          <pre className="whitespace-pre-wrap">{prompt.content.substring(0, 300)}...</pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 우측: 프롬프트 편집 */}
          <div className="lg:col-span-2 space-y-6">
            {selectedPrompt ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">프롬프트 편집</h2>
                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      {isEditing ? '취소' : '편집'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* 이름 */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        이름 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        {...register('name')}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    {/* 설명 */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        설명 <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="description"
                        {...register('description')}
                        disabled={!isEditing}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                      )}
                    </div>

                    {/* 프롬프트 내용 */}
                    <div>
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                        프롬프트 내용 <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="content"
                        {...register('content')}
                        disabled={!isEditing}
                        rows={20}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 font-mono text-sm"
                        placeholder="시스템 프롬프트를 입력해 주세요..."
                      />
                      {errors.content && (
                        <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                      )}
                    </div>

                    {/* 저장 버튼 */}
                    {isEditing && (
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          loading={isLoading}
                          className="flex items-center"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          저장
                        </Button>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Edit className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    좌측에서 편집할 프롬프트를 선택해 주세요.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 