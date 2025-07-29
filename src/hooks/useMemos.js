import { useState, useEffect, useCallback } from 'react';

const useMemos = (currentProject, selectedTask, tasksData) => {
  // 메모 관리 상태
  const [taskMemos, setTaskMemos] = useState({});
  const [currentMemo, setCurrentMemo] = useState('');
  const [isMemoModified, setIsMemoModified] = useState(false);
  
  // 대시보드 메모 상태
  const [dashboardMemo, setDashboardMemo] = useState('');
  const [isDashboardMemoModified, setIsDashboardMemoModified] = useState(false);

  // 직접 입력 모드 메모 로드
  const loadDirectInputMemos = useCallback(async () => {
    try {
      const response = await fetch('/api/load-memo/direct_input', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (result.success && result.memos) {
        setTaskMemos(result.memos);
        // 현재 선택된 태스크의 메모 업데이트
        if (selectedTask) {
          const memoKey = selectedTask.id.toString();
          const savedMemo = result.memos[memoKey] || '';
          setCurrentMemo(savedMemo);
          setIsMemoModified(false);
        }
        console.log('Direct input memos loaded from file');
      } else {
        setTaskMemos({});
        if (selectedTask) {
          setCurrentMemo('');
          setIsMemoModified(false);
        }
        console.log('No direct input memos found');
      }
    } catch (error) {
      console.log('Failed to load direct input memos:', error);
      setTaskMemos({});
    }
  }, [selectedTask]);
  
  // 프로젝트별 메모 파일 로드
  const loadProjectMemos = useCallback(async (project) => {
    if (!project) return;
    
    try {
      const response = await fetch(`/api/load-memo/${project.folderName}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (result.success && result.memos) {
        setTaskMemos(result.memos);
        // 현재 선택된 태스크의 메모 업데이트
        if (selectedTask) {
          const memoKey = selectedTask.id.toString();
          const savedMemo = result.memos[memoKey] || '';
          setCurrentMemo(savedMemo);
          setIsMemoModified(false);
        }
        console.log(`Memos loaded from: ${result.path}`);
      } else {
        // 메모 파일이 없으면 빈 객체로 초기화
        setTaskMemos({});
        if (selectedTask) {
          setCurrentMemo('');
          setIsMemoModified(false);
        }
        console.log(`No task-memo.json found for project: ${project.name}`);
      }
    } catch (error) {
      console.log(`Failed to load memos for project: ${project.name}`, error);
      setTaskMemos({});
    }
  }, [selectedTask]);
  
  // 현재 메모 업데이트
  const handleMemoChange = (memo) => {
    setCurrentMemo(memo);
    setIsMemoModified(true);
  };
  
  // 메모 저장 (API를 통해 파일에 저장)
  const saveMemo = async () => {
    if (!selectedTask) {
      return;
    }
    
    // 저장 중 상태 변경 방지
    const currentMemoValue = currentMemo;
    const memoKey = selectedTask.id.toString();
    const updatedMemos = {
      ...taskMemos,
      [memoKey]: currentMemoValue
    };
    const projectName = currentProject ? currentProject.folderName : 'direct_input';
    
    try {
      const response = await fetch('/api/save-memo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: projectName,
          memos: updatedMemos
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // 로컬 상태 업데이트
        setTaskMemos(updatedMemos);
        setIsMemoModified(false);
        console.log(`✅ Memo saved for task ${selectedTask.id}: ${result.message}`);
      } else {
        console.error('Failed to save memo:', result.error);
        alert('메모 저장에 실패했습니다: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving memo:', error);
      alert('메모 저장 중 오류가 발생했습니다: ' + error.message);
    }
  };

  const loadDashboardMemo = useCallback(async () => {
    try {
      const projectName = currentProject ? currentProject.folderName : 'direct_input';
      const response = await fetch(`/api/load-dashboard-memo/${projectName}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (result.success && result.memo) {
        setDashboardMemo(result.memo);
        setIsDashboardMemoModified(false);
        console.log(`Dashboard memo loaded from: ${result.path}`);
      } else {
        setDashboardMemo('');
        setIsDashboardMemoModified(false);
        console.log(`No dashboard memo found for project: ${projectName}`);
      }
    } catch (error) {
      const projectName = currentProject ? currentProject.folderName : 'direct_input';
      console.log(`Failed to load dashboard memo for project: ${projectName}`, error);
      setDashboardMemo('');
      setIsDashboardMemoModified(false);
    }
  }, [currentProject]);
  
  // 대시보드 메모 저장
  const saveDashboardMemo = async () => {
    // 저장 중 상태 변경 방지
    const currentMemoValue = dashboardMemo;
    const projectName = currentProject ? currentProject.folderName : 'direct_input';
    
    try {
      const response = await fetch('/api/save-dashboard-memo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: projectName,
          memo: currentMemoValue
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // 상태 업데이트
        setIsDashboardMemoModified(false);
        console.log(`✅ Dashboard memo saved: ${result.message}`);
      } else {
        console.error('Failed to save dashboard memo:', result.error);
        alert('대시보드 메모 저장에 실패했습니다: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving dashboard memo:', error);
      alert('대시보드 메모 저장 중 오류가 발생했습니다: ' + error.message);
    }
  };

  const handleDashboardMemoChange = (memo) => {
    setDashboardMemo(memo);
    setIsDashboardMemoModified(true);
  };

  // 현재 프로젝트가 변경될 때 메모 로드 (tasksData가 있을 때만)
  useEffect(() => {
    if (!tasksData) return; // 데이터가 없으면 메모 로드하지 않음
    
    if (currentProject) {
      loadProjectMemos(currentProject);
    } else {
      // 직접 입력 모드일 때 API를 통해 메모 로드
      loadDirectInputMemos();
    }
  }, [currentProject?.id ?? null, tasksData, currentProject, loadProjectMemos, loadDirectInputMemos]);
  
  // 대시보드 메모 로드 (tasksData가 있을 때만)
  useEffect(() => {
    if (!tasksData) return; // 데이터가 없으면 메모 로드하지 않음
    loadDashboardMemo();
  }, [currentProject?.id ?? null, tasksData, loadDashboardMemo]);

  // 선택된 태스크가 변경될 때 해당 메모 로드
  useEffect(() => {
    if (selectedTask) {
      const memoKey = selectedTask.id.toString();
      const savedMemo = taskMemos[memoKey] || '';
      setCurrentMemo(savedMemo);
      setIsMemoModified(false);
    }
  }, [selectedTask, taskMemos]);

  return {
    // 태스크 메모 상태
    taskMemos,
    currentMemo,
    isMemoModified,
    
    // 대시보드 메모 상태
    dashboardMemo,
    isDashboardMemoModified,
    
    // 액션 함수
    handleMemoChange,
    saveMemo,
    handleDashboardMemoChange,
    saveDashboardMemo,
    loadProjectMemos,
    loadDirectInputMemos,
    loadDashboardMemo
  };
};

export default useMemos;