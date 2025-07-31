import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Play, Pause } from 'lucide-react';

const InactivityModal = ({ 
  isOpen, 
  inactivityDuration, 
  onContinue, 
  onPause,
  onClose,
  autoCloseDelay = 30000 // 30초 후 자동 일시정지
}) => {
  const [timeLeft, setTimeLeft] = useState(autoCloseDelay / 1000);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(autoCloseDelay / 1000);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // 자동으로 일시정지
          onPause();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, autoCloseDelay, onPause]);

  const formatDuration = (milliseconds) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
      return `${minutes}분 ${seconds}초`;
    }
    return `${seconds}초`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 bg-yellow-50 border-2 border-yellow-200">
        {/* 경고 아이콘 */}
        <div className="flex justify-center mb-6">
          <AlertTriangle className="w-16 h-16 text-yellow-500" />
        </div>

        {/* 제목 */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
          활동이 감지되지 않습니다
        </h2>

        {/* 메시지 */}
        <p className="text-gray-600 text-center mb-2">
          {formatDuration(inactivityDuration)} 동안 마우스나 키보드 움직임이 없었습니다.
        </p>

        <p className="text-gray-700 text-center mb-6 font-medium">
          계속 작업 중이신가요?
        </p>

        {/* 자동 종료 타이머 */}
        <div className="flex items-center justify-center gap-2 mb-8 text-sm text-orange-600 bg-orange-100 rounded-lg p-3">
          <Clock className="w-4 h-4" />
          <span>{timeLeft}초 후 자동으로 타이머가 일시정지됩니다</span>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={onPause}
            className="flex-1 px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Pause className="w-4 h-4" />
            일시정지
          </button>
          <button
            onClick={onContinue}
            className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            계속 진행
          </button>
        </div>
      </div>
    </div>
  );
};

export default InactivityModal;