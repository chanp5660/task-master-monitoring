import { useState, useEffect, useRef, useCallback } from 'react';

const useActivityDetection = ({ 
  isActive = false, 
  inactivityThreshold = 5 * 60 * 1000, // 5분 (밀리초)
  onInactivityDetected,
  onActivityResumed,
  enabled = true
}) => {
  const [isUserActive, setIsUserActive] = useState(true);
  const [inactivityDuration, setInactivityDuration] = useState(0);
  const lastActivityRef = useRef(Date.now());
  const inactivityTimerRef = useRef(null);
  const checkIntervalRef = useRef(null);

  // isActive가 true가 될 때 lastActivity를 현재 시간으로 리셋
  useEffect(() => {
    if (isActive && enabled) {
      lastActivityRef.current = Date.now();
    }
  }, [isActive, enabled]);

  // 활동 감지 함수
  const detectActivity = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    console.log('👆 Activity detected at:', new Date(now).toLocaleTimeString());
    
    if (!isUserActive) {
      console.log('✅ User activity resumed');
      setIsUserActive(true);
      setInactivityDuration(0);
      if (onActivityResumed) {
        onActivityResumed();
      }
    }
  }, [isUserActive, onActivityResumed]);

  // 이벤트 리스너들
  useEffect(() => {
    if (!enabled || !isActive) {
      return;
    }

    const events = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // 이벤트 리스너 등록
    events.forEach(event => {
      document.addEventListener(event, detectActivity, true);
    });

    // 정리 함수
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, detectActivity, true);
      });
    };
  }, [enabled, isActive, detectActivity]);

  // 비활성 상태 확인 타이머
  useEffect(() => {
    if (!enabled || !isActive) {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      console.log('🛑 Activity detection stopped:', { enabled, isActive });
      return;
    }

    // Clear any existing interval first
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }

    console.log('🔍 Activity detection started:', { 
      enabled, 
      isActive, 
      inactivityThreshold,
      currentTime: new Date().toLocaleTimeString(),
      lastActivity: new Date(lastActivityRef.current).toLocaleTimeString()
    });

    checkIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      
      setInactivityDuration(timeSinceLastActivity);

      console.log('⏱️ Activity check:', { 
        timeSinceLastActivity: Math.round(timeSinceLastActivity / 1000) + 's', 
        inactivityThreshold: Math.round(inactivityThreshold / 1000) + 's', 
        isUserActive,
        shouldTrigger: timeSinceLastActivity >= inactivityThreshold && isUserActive,
        lastActivityTime: new Date(lastActivityRef.current).toLocaleTimeString()
      });

      if (timeSinceLastActivity >= inactivityThreshold && isUserActive) {
        console.log('🚨 Inactivity detected! Triggering modal...');
        setIsUserActive(false);
        if (onInactivityDetected) {
          onInactivityDetected(timeSinceLastActivity);
        }
      }
    }, 1000); // 1초마다 확인

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [enabled, isActive, inactivityThreshold]); // Remove isUserActive and onInactivityDetected from dependencies

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  // 수동으로 활동 상태 재설정
  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIsUserActive(true);
    setInactivityDuration(0);
  }, []);

  return {
    isUserActive,
    inactivityDuration,
    resetActivity,
    lastActivity: lastActivityRef.current
  };
};

export default useActivityDetection;