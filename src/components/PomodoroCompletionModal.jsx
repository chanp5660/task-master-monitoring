import React from 'react';
import { CheckCircle, Clock, Coffee, Play } from 'lucide-react';

const PomodoroCompletionModal = ({ 
  isOpen, 
  sessionType, 
  onConfirm, 
  onClose,
  duration,
  nextSessionType,
  isLongBreak = false
}) => {
  if (!isOpen) return null;

  const getSessionInfo = () => {
    if (sessionType === 'work') {
      return {
        icon: <CheckCircle className="w-16 h-16 text-green-500" />,
        title: '작업 세션 완료!',
        message: `${duration}분간 집중하신 것을 축하합니다!`,
        nextMessage: `이제 ${isLongBreak ? '긴 ' : ''}휴식 시간입니다.`,
        buttonText: '휴식 시작',
        buttonIcon: <Coffee className="w-4 h-4" />,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    } else {
      return {
        icon: <Coffee className="w-16 h-16 text-blue-500" />,
        title: `${isLongBreak ? '긴 ' : ''}휴식 완료!`,
        message: `${duration}분간 잘 쉬셨습니다!`,
        nextMessage: '다시 집중해서 작업해볼까요?',
        buttonText: '작업 시작',
        buttonIcon: <Play className="w-4 h-4" />,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    }
  };

  const sessionInfo = getSessionInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 ${sessionInfo.bgColor} border-2 ${sessionInfo.borderColor}`}>
        {/* 아이콘 */}
        <div className="flex justify-center mb-6">
          {sessionInfo.icon}
        </div>

        {/* 제목 */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
          {sessionInfo.title}
        </h2>

        {/* 메시지 */}
        <p className="text-gray-600 text-center mb-2">
          {sessionInfo.message}
        </p>

        <p className="text-gray-700 text-center mb-8 font-medium">
          {sessionInfo.nextMessage}
        </p>

        {/* 시간 정보 */}
        <div className="flex items-center justify-center gap-2 mb-8 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>다음 세션: {nextSessionType === 'work' ? '작업' : `${isLongBreak ? '긴 ' : ''}휴식`}</span>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            나중에
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-6 py-3 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2 ${
              sessionType === 'work' 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {sessionInfo.buttonIcon}
            {sessionInfo.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PomodoroCompletionModal;