import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, RotateCcw, BarChart3, Settings } from 'lucide-react';

const PomodoroTimer = ({ currentTask, onSessionComplete, onShowStats, onTaskStatusChange }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25분을 초로 변환
  const [isActive, setIsActive] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true); // true: 작업 세션, false: 휴식 세션
  const [sessionCount, setSessionCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [customWorkTime, setCustomWorkTime] = useState(25);
  const [customBreakTime, setCustomBreakTime] = useState(5);
  const [customLongBreakTime, setCustomLongBreakTime] = useState(15);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [isSkipped, setIsSkipped] = useState(false); // 건너뛰기 플래그
  const intervalRef = useRef(null);

  const WORK_TIME = customWorkTime * 60;
  const BREAK_TIME = customBreakTime * 60;
  const LONG_BREAK_TIME = customLongBreakTime * 60;

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isSkipped) {
      handleSessionEnd();
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, timeLeft, isSkipped]);

  const handleSessionEnd = () => {
    setIsActive(false);
    
    // 작업 세션만 기록 (휴식 세션은 저장하지 않음)
    if (isWorkSession) {
      const sessionData = {
        id: Date.now().toString(),
        taskId: currentTask?.id || null,
        taskTitle: currentTask?.title || 'No task selected',
        type: 'work',
        duration: WORK_TIME / 60,
        startTime: sessionStartTime ? sessionStartTime.toISOString() : new Date(Date.now() - WORK_TIME * 1000).toISOString(),
        endTime: new Date().toISOString(),
        completed: true
      };
      
      console.log('✅ 정상 완료 세션 데이터:', sessionData);
      
      if (onSessionComplete) {
        onSessionComplete(sessionData);
      }
    }
    
    setSessionStartTime(null);
    setIsSkipped(false); // 플래그 리셋

    // 다음 세션으로 전환
    if (isWorkSession) {
      setSessionCount(prev => prev + 1);
      const nextSessionCount = sessionCount + 1;
      
      // 4번째 작업 세션 후에는 긴 휴식 (4, 8, 12, 16...)
      if (nextSessionCount % 4 === 0) {
        setTimeLeft(LONG_BREAK_TIME);
      } else {
        setTimeLeft(BREAK_TIME);
      }
      setIsWorkSession(false);
    } else {
      setTimeLeft(WORK_TIME);
      setIsWorkSession(true);
    }

    // 브라우저 알림 (권한이 있을 경우)
    if (Notification.permission === 'granted') {
      new Notification(
        isWorkSession ? '작업 시간 완료!' : '휴식 시간 완료!',
        {
          body: isWorkSession ? '휴식 시간을 가지세요.' : '다시 작업을 시작하세요.',
          icon: '/favicon.ico'
        }
      );
    }
  };

  const toggleTimer = () => {
    const newIsActive = !isActive;
    setIsActive(newIsActive);
    
    // 세션 시작 시간 기록
    if (newIsActive && !sessionStartTime) {
      setSessionStartTime(new Date());
    }
    
    // 작업 세션 시작 시 현재 작업을 'in-progress'로 변경
    if (newIsActive && isWorkSession && currentTask && onTaskStatusChange) {
      if (currentTask.status === 'pending' || currentTask.status === 'deferred') {
        onTaskStatusChange(currentTask.id, 'in-progress');
      }
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    // 현재 세션 타입에 맞는 시간으로 리셋
    if (isWorkSession) {
      setTimeLeft(WORK_TIME);
    } else {
      // 휴식 세션인 경우 현재 세션 카운트에 따라 결정
      setTimeLeft((sessionCount % 4 === 0) ? LONG_BREAK_TIME : BREAK_TIME);
    }
    setSessionStartTime(null);
    setIsSkipped(false); // 플래그 리셋
  };

  const skipSession = () => {
    setIsSkipped(true); // 건너뛰기 플래그 설정
    
    // 작업 세션 건너뛰기 시에만 기록 (진행했던 시간만큼 모두 기록)
    if (sessionStartTime && isWorkSession) {
      const actualSeconds = Math.round((Date.now() - sessionStartTime.getTime()) / 1000);
      const actualMinutes = Math.round(actualSeconds / 60);
      
      // 진행했던 모든 시간을 기록 (최소 1분)
      const recordMinutes = Math.max(1, actualMinutes);
      
      const sessionData = {
        id: Date.now().toString(),
        taskId: currentTask?.id || null,
        taskTitle: currentTask?.title || 'No task selected',
        type: 'work',
        duration: recordMinutes,
        startTime: sessionStartTime.toISOString(),
        endTime: new Date().toISOString(),
        completed: false, // 건너뛰기는 미완료로 기록
        skipped: true
      };
      
      console.log('⏭️ 건너뛰기 세션 데이터:', {
        actualSeconds,
        actualMinutes,
        recordMinutes,
        fullTime: WORK_TIME / 60,
        sessionData
      });
      
      if (onSessionComplete) {
        onSessionComplete(sessionData);
      }
    }
    
    setSessionStartTime(null);
    setIsActive(false); // 타이머 정지
    
    // 작업 세션 건너뛰기 후 휴식 세션으로 전환
    if (isWorkSession) {
      setSessionCount(prev => prev + 1);
      const nextSessionCount = sessionCount + 1;
      
      // 4번째 작업 세션 후에는 긴 휴식 (4, 8, 12, 16...)
      if (nextSessionCount % 4 === 0) {
        setTimeLeft(LONG_BREAK_TIME);
      } else {
        setTimeLeft(BREAK_TIME);
      }
      setIsWorkSession(false);
    } else {
      // 휴식 세션 건너뛰기 후 작업 세션으로 전환 (휴식은 저장하지 않음)
      setTimeLeft(WORK_TIME);
      setIsWorkSession(true);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const totalTime = isWorkSession ? WORK_TIME : ((sessionCount % 4 === 0) ? LONG_BREAK_TIME : BREAK_TIME);
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  // 브라우저 알림 권한 요청
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        {/* 세션 타입 표시 */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isWorkSession ? 'bg-red-500' : 'bg-green-500'}`}></div>
          <span className="text-xs text-gray-600 font-medium">
            {isWorkSession ? '작업' : ((sessionCount % 4 === 0) ? '긴 휴식' : '휴식')}
          </span>
        </div>

      {/* 타이머 디스플레이 */}
      <div className="relative flex items-center">
        <div className="text-lg font-mono font-bold text-gray-800 min-w-16 text-center">
          {formatTime(timeLeft)}
        </div>
        
        {/* 진행률 표시 (작은 프로그레스 바) */}
        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gray-200 rounded-full">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${
              isWorkSession ? 'bg-red-500' : 'bg-green-500'
            }`}
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>

      {/* 컨트롤 버튼들 */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleTimer}
          className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
            isActive ? 'text-yellow-600' : 'text-green-600'
          }`}
          title={isActive ? '일시정지' : '시작'}
        >
          {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        
        <button
          onClick={resetTimer}
          className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-600"
          title="리셋"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        
        <button
          onClick={skipSession}
          className="p-1.5 rounded hover:bg-gray-100 transition-colors text-blue-600"
          title="세션 건너뛰기"
        >
          <Square className="w-4 h-4" />
        </button>
        
        {/* 통계 보기 버튼 */}
        <button
          onClick={onShowStats}
          className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-600"
          title="통계 보기"
        >
          <BarChart3 className="w-4 h-4" />
        </button>
        
        {/* 설정 버튼 */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-600"
          title="시간 설정"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* 세션 카운터 */}
      <div className="text-xs text-gray-500">
        {Math.floor(sessionCount / 2) + (isWorkSession ? 1 : 0)}/∞
      </div>
    </div>

    {/* 설정 모달 */}
    {showSettings && (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 min-w-72">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">타이머 설정</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-600">작업 시간 (분)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={customWorkTime}
              onChange={(e) => setCustomWorkTime(parseInt(e.target.value) || 25)}
              className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
              disabled={isActive}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-600">휴식 시간 (분)</label>
            <input
              type="number"
              min="1"
              max="30"
              value={customBreakTime}
              onChange={(e) => setCustomBreakTime(parseInt(e.target.value) || 5)}
              className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
              disabled={isActive}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-600">긴 휴식 시간 (분)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={customLongBreakTime}
              onChange={(e) => setCustomLongBreakTime(parseInt(e.target.value) || 15)}
              className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
              disabled={isActive}
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
          <button
            onClick={() => {
              setCustomWorkTime(25);
              setCustomBreakTime(5);
              setCustomLongBreakTime(15);
            }}
            className="text-xs text-gray-500 hover:text-gray-700"
            disabled={isActive}
          >
            기본값 복원
          </button>
          
          <button
            onClick={() => {
              // 현재 세션에 새 시간 적용
              if (!isActive) {
                if (isWorkSession) {
                  setTimeLeft(customWorkTime * 60);
                } else {
                  // 휴식 세션인 경우 현재 세션 카운트에 따라 결정
                  setTimeLeft((sessionCount % 4 === 0) ? customLongBreakTime * 60 : customBreakTime * 60);
                }
              }
              setShowSettings(false);
            }}
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            적용
          </button>
        </div>
      </div>
    )}
  </div>
  );
};

export default PomodoroTimer;