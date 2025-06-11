import React from 'react';
import { Clock, FileText, BookOpen } from 'lucide-react';

interface LoadingModalProps {
  isOpen: boolean;
  type: 'outline' | 'report';
  title: string;
  message: string;
}

export const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  type,
  title,
  message
}) => {
  if (!isOpen) return null;

  const Icon = type === 'outline' ? BookOpen : FileText;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      {/* 모달 컨텐츠 */}
      <div className="relative bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {/* 아이콘과 스피너 */}
          <div className="relative mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Icon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="absolute inset-0 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          
          {/* 제목 */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          
          {/* 메시지 */}
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          {/* 진행 상태 */}
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>AI가 처리 중입니다...</span>
          </div>
          
          {/* 예상 시간 */}
          <div className="mt-4 text-xs text-gray-400">
            예상 소요 시간: {type === 'outline' ? '30초 - 1분' : '1분 - 2분'}
          </div>
        </div>
      </div>
    </div>
  );
}; 