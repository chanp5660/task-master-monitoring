import React, { useState, useCallback, useEffect } from 'react';

const ResizablePane = ({ 
  children, 
  defaultWidth = 800, // 기본 사이드바 너비를 최대로 설정
  minWidth = 280, 
  maxWidth = 800,
  onWidthChange 
}) => {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return;

    const newWidth = window.innerWidth - e.clientX;
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setWidth(newWidth);
      if (onWidthChange) {
        onWidthChange(newWidth);
      }
    }
  }, [isResizing, minWidth, maxWidth, onWidthChange]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <>
      {/* 리사이저 핸들 */}
      <div
        className={`fixed top-0 bottom-0 w-2 hover:w-3 cursor-col-resize z-40 transition-all duration-200 ${
          isResizing 
            ? 'bg-blue-500 w-3 shadow-lg' 
            : 'bg-gray-300 hover:bg-blue-400 hover:shadow-md'
        }`}
        style={{ right: width - 1 }}
        onMouseDown={handleMouseDown}
        title="드래그해서 사이드바 크기 조절"
      >
        {/* 시각적 표시를 위한 중앙 그립 */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-12 rounded-full transition-all ${
          isResizing ? 'bg-white' : 'bg-gray-500'
        }`}></div>
        
        {/* 추가적인 그립 라인들 */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full transition-all ${
          isResizing ? 'bg-white opacity-70' : 'bg-gray-500 opacity-50'
        }`} style={{ marginTop: '-18px' }}></div>
        
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full transition-all ${
          isResizing ? 'bg-white opacity-70' : 'bg-gray-500 opacity-50'
        }`} style={{ marginTop: '18px' }}></div>
      </div>

      {/* 사이드바 콘텐츠 */}
      <div
        className="fixed top-0 right-0 h-full bg-white shadow-xl border-l border-gray-200 z-50"
        style={{ width }}
      >
        {children}
      </div>
    </>
  );
};

export default ResizablePane;