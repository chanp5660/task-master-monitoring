import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, Plus } from 'lucide-react';

const OvertimeModal = ({ 
  isOpen, 
  overtimeDuration, 
  onAddTime, 
  onFinish,
  onClose,
  reminderInterval = 5 * 60 * 1000 // 5분마다 알림
}) => {
  const [nextReminderIn, setNextReminderIn] = useState(reminderInterval / 1000);
  const [totalOvertimeMinutes, setTotalOvertimeMinutes] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setNextReminderIn(reminderInterval / 1000);
      return;
    }

    // 초과 시간을 분 단위로 계산
    setTotalOvertimeMinutes(Math.floor(overtimeDuration / (1000 * 60)));

    const timer = setInterval(() => {
      setNextReminderIn(prev => {
        if (prev <= 1) {
          // 다음 알림 시간 리셋
          return reminderInterval / 1000;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, overtimeDuration, reminderInterval]);

  const formatDuration = (milliseconds) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
      return `${minutes}분 ${seconds}초`;
    }
    return `${seconds}초`;
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 bg-orange-50 border-2 border-orange-200">
        {/* 시계 아이콘 */}
        <div className="flex justify-center mb-6">
          <Clock className="w-16 h-16 text-orange-500" />
        </div>

        {/* 제목 */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
          시간이 초과되었습니다!
        </h2>

        {/* 메시지 */}
        <p className="text-gray-600 text-center mb-2">
          설정된 작업 시간을 {formatDuration(overtimeDuration)} 초과했습니다.
        </p>

        <p className="text-gray-700 text-center mb-6 font-medium">
          추가 시간을 기록하시겠습니까?
        </p>

        {/* 초과 시간 정보 */}
        <div className="bg-orange-100 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-orange-700">총 초과 시간:</span>
            <span className="font-bold text-orange-800">{totalOvertimeMinutes}분</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-orange-700">다음 알림까지:</span>
            <span className="font-mono text-orange-800">{formatTime(nextReminderIn)}</span>
          </div>
        </div>

        {/* 알림 메시지 */}
        <div className="flex items-center justify-center gap-2 mb-8 text-sm text-orange-600 bg-yellow-100 rounded-lg p-3">
          <AlertCircle className="w-4 h-4" />
          <span>초과 시간도 모두 작업 시간으로 기록됩니다</span>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={onFinish}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            작업 완료
          </button>
          <button
            onClick={() => onAddTime(5)} // 5분 추가
            className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            5분 추가
          </button>
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          나중에 알림
        </button>
      </div>
    </div>
  );
};

export default OvertimeModal;