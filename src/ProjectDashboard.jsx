import React, { useState, useEffect, useMemo } from 'react';
import { Search, CheckCircle, Clock, AlertCircle, BarChart3, Eye, Edit, Save, X, FileText, Users, Target, Play, Pause, RefreshCw, Ban, ExternalLink, ChevronUp, ChevronDown, MessageSquare, Plus, FolderPlus, Github } from 'lucide-react';

const ProjectDashboard = () => {
  const [tasksData, setTasksData] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [jsonInput, setJsonInput] = useState('');
  const [manualOrder, setManualOrder] = useState([]);
  
  // 프로젝트 관리 상태
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  
  // 메모 관리 상태
  const [taskMemos, setTaskMemos] = useState({});
  const [currentMemo, setCurrentMemo] = useState('');
  const [originalMemo, setOriginalMemo] = useState(''); // 저장된 원본 메모
  
  // 대시보드 메모 상태
  const [dashboardMemo, setDashboardMemo] = useState('');
  const [originalDashboardMemo, setOriginalDashboardMemo] = useState('');
  
  // 프로젝트 추가 모달 상태
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectPath, setNewProjectPath] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  

  // 페이지 로드 시 사용 가능한 프로젝트 목록 로드
  useEffect(() => {
    loadAvailableProjects();
  }, []);
  
  // 현재 프로젝트가 변경될 때 메모 로드
  useEffect(() => {
    if (currentProject) {
      loadProjectMemos(currentProject);
    } else {
      // 직접 입력 모드일 때 API를 통해 메모 로드
      loadDirectInputMemos();
    }
  }, [currentProject]);
  
  // 대시보드 메모 로드
  useEffect(() => {
    loadDashboardMemo();
  }, [currentProject]);

  // 직접 입력 모드 메모 로드
  const loadDirectInputMemos = async () => {
    try {
      const response = await fetch('/api/load-memo/direct_input', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (result.success && result.memos) {
        setTaskMemos(result.memos);
        console.log('Direct input memos loaded from file');
      } else {
        setTaskMemos({});
        console.log('No direct input memos found');
      }
    } catch (error) {
      console.log('Failed to load direct input memos:', error);
      setTaskMemos({});
    }
  };
  
  // 선택된 태스크가 변경될 때 해당 메모 로드
  useEffect(() => {
    if (selectedTask) {
      const memoKey = selectedTask.id.toString();
      const savedMemo = taskMemos[memoKey] || '';
      setCurrentMemo(savedMemo);
      setOriginalMemo(savedMemo);
    }
  }, [selectedTask, taskMemos]);

  // 현재 프로젝트가 경로 기반일 때 새로고침 시 자동 로드
  useEffect(() => {
    if (currentProject && (currentProject.path || currentProject.externalPath) && !tasksData) {
      loadProjectFromPath(currentProject);
    }
  }, [currentProject]);

  // 사용 가능한 프로젝트 목록 로드
  const loadAvailableProjects = async () => {
    try {
      // 일반 프로젝트와 외부 링크 프로젝트를 병렬로 로드
      const [projectsResponse, externalResponse] = await Promise.all([
        fetch('/api/scan-projects', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }),
        fetch('/api/scan-external-links', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      ]);
      
      const projectsResult = await projectsResponse.json();
      const externalResult = await externalResponse.json();
      
      let allProjects = [];
      
      // 일반 프로젝트 추가
      if (projectsResult.success && projectsResult.projects) {
        allProjects = [...projectsResult.projects];
      }
      
      // 외부 링크 프로젝트 추가
      if (externalResult.success && externalResult.externalProjects) {
        allProjects = [...allProjects, ...externalResult.externalProjects];
      }
      
      if (allProjects.length > 0) {
        setProjects(allProjects);
        console.log(`Found ${allProjects.length} projects (${projectsResult.projects?.length || 0} local, ${externalResult.externalProjects?.length || 0} external)`);
      } else {
        console.warn('No projects found, using fallback');
        // 백업용 하드코딩된 프로젝트 목록
        const fallbackProjects = [
          {
            id: 1,
            name: 'CPUE 예측(데이터셋 구축)',
            folderName: 'cpue_prediction_dataset',
            path: 'projects/cpue_prediction_dataset/tasks.json',
            description: 'CPUE 예측 프로젝트(데이터셋 구축)'
          },
          {
            id: 2,
            name: '테스트',
            folderName: 'test',
            path: 'projects/test/tasks.json',
            description: '테스트 프로젝트'
          }
        ];
        setProjects(fallbackProjects);
      }
    } catch (error) {
      console.error('Error scanning projects:', error);
      // 네트워크 오류 시 백업용 프로젝트 목록 사용
      const fallbackProjects = [
        {
          id: 1,
          name: 'CPUE 예측(데이터셋 구축)',
          folderName: 'cpue_prediction_dataset',
          path: 'projects/cpue_prediction_dataset/tasks.json',
          description: 'CPUE 예측 프로젝트(데이터셋 구축)'
        },
        {
          id: 2,
          name: '테스트',
          folderName: 'test',
          path: 'projects/test/tasks.json',
          description: '테스트 프로젝트'
        }
      ];
      setProjects(fallbackProjects);
      setLoadError('Failed to automatically scan projects. Using default project list.');
    }
  };

  // 외부 경로에서 프로젝트 로드
  const loadExternalProject = async (project) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      console.log(`Loading external project from: ${project.externalPath}`);
      
      const response = await fetch('/api/load-external-path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          externalPath: project.externalPath
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load external project');
      }
      
      const data = result.data;
      
      // tasks.json 구조 확인 및 적절한 데이터 추출
      let tasksToSet;
      if (data.master && data.master.tasks) {
        tasksToSet = data.master;
      } else if (data.tasks) {
        tasksToSet = data;
      } else if (Array.isArray(data)) {
        tasksToSet = { tasks: data };
      } else {
        throw new Error('Invalid data structure. Expected "master.tasks" or "tasks" array.');
      }
      
      setTasksData(tasksToSet);
      setCurrentProject(project);
      // 새 프로젝트 로드 시 상태+의존성 정렬 자동 적용
      const dependencyOrder = getTopologicalOrder(tasksToSet.tasks);
      setManualOrder(dependencyOrder);
      console.log(`External project "${project.name}" loaded successfully from ${result.path}!`);
    } catch (error) {
      console.error('Load external project error:', error);
      setLoadError(`Failed to load external project: ${error.message}`);
      setCurrentProject(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 경로에서 프로젝트 로드
  const loadProjectFromPath = async (project) => {
    // 외부 링크 프로젝트인 경우 별도 처리
    if (project.isExternal && project.externalPath) {
      return loadExternalProject(project);
    }
    
    setIsLoading(true);
    setLoadError(null);
    try {
      // 경로 정규화 - 상대 경로나 절대 경로 처리
      let fetchPath = project.path;
      
      // 상대 경로인 경우 현재 도메인 기준으로 변환
      if (fetchPath.startsWith('./')) {
        fetchPath = fetchPath.substring(2);
      } else if (fetchPath.startsWith('/')) {
        // 절대 경로는 그대로 사용
        fetchPath = fetchPath;
      }
      
      // localhost나 같은 서버에서 파일을 가져오는 경우
      if (!fetchPath.startsWith('http')) {
        fetchPath = `${window.location.origin}/${fetchPath}`;
      }
      
      console.log(`Loading project from: ${fetchPath}`);
      
      const response = await fetch(fetchPath, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // CORS 모드 설정
        mode: 'cors',
        // 캐시 무시하여 최신 데이터 가져오기
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const text = await response.text();
      
      // JSON 파싱 전에 텍스트 확인
      if (!text.trim()) {
        throw new Error('Empty response received');
      }
      
      // HTML 응답 체크 (일반적인 에러 원인)
      if (text.trim().startsWith('<')) {
        throw new Error('Received HTML response instead of JSON. Check if the file path is correct and the server is configured properly.');
      }
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error(`Invalid JSON format: ${parseError.message}`);
      }
      
      // tasks.json 구조 확인 및 적절한 데이터 추출
      let tasksToSet;
      if (data.master && data.master.tasks) {
        tasksToSet = data.master;
      } else if (data.tasks) {
        tasksToSet = data;
      } else if (Array.isArray(data)) {
        tasksToSet = { tasks: data };
      } else {
        throw new Error('Invalid data structure. Expected "master.tasks" or "tasks" array.');
      }
      
      setTasksData(tasksToSet);
      setCurrentProject(project);
      // 새 프로젝트 로드 시 상태+의존성 정렬 자동 적용
      const dependencyOrder = getTopologicalOrder(tasksToSet.tasks);
      setManualOrder(dependencyOrder);
      console.log(`Project "${project.name}" loaded successfully!`);
    } catch (error) {
      console.error('Load project error:', error);
      setLoadError(`Failed to load project: ${error.message}`);
      setCurrentProject(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 대시보드 새로고침
  const refreshDashboard = () => {
    if (currentProject && (currentProject.path || currentProject.externalPath)) {
      loadProjectFromPath(currentProject);
    } else {
      window.location.reload();
    }
  };

  // JSON 입력 처리
  const handleJsonSubmit = () => {
    if (!jsonInput.trim()) {
      setLoadError('Please enter JSON data');
      return;
    }

    try {
      const data = JSON.parse(jsonInput);
      
      // tasks.json 구조 확인 및 적절한 데이터 추출
      let tasksToSet;
      if (data.master && data.master.tasks) {
        tasksToSet = data.master;
      } else if (data.tasks) {
        tasksToSet = data;
      } else if (Array.isArray(data)) {
        tasksToSet = { tasks: data };
      } else {
        throw new Error('Invalid data structure. Expected "master.tasks" or "tasks" array.');
      }
      
      setTasksData(tasksToSet);
      setCurrentProject(null); // 직접 입력한 경우는 currentProject를 null로 설정
      // JSON 입력 시 상태+의존성 정렬 자동 적용
      const dependencyOrder = getTopologicalOrder(tasksToSet.tasks);
      setManualOrder(dependencyOrder);
      setJsonInput('');
      setLoadError(null);
    } catch (error) {
      setLoadError('Invalid JSON format: ' + error.message);
    }
  };

  // 상태별 색상
  const getStatusColor = (status) => {
    switch (status) {
      case 'done': 
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'review': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'deferred': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': 
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 우선순위 색상
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // 의존성이 완료되지 않은 작업인지 확인
  const hasUncompletedDependencies = (task) => {
    if (!task.dependencies || task.dependencies.length === 0) return false;
    
    return task.dependencies.some(depId => {
      const dependentTask = tasksData.tasks.find(t => t.id === depId);
      return dependentTask && dependentTask.status !== 'done' && dependentTask.status !== 'completed';
    });
  };

  // 바로 진행 가능한 작업인지 확인 (모든 의존성이 완료되고 본인은 미완료)
  const isReadyToStart = (task) => {
    // 이미 완료된 작업은 진행 가능 표시하지 않음
    if (task.status === 'done' || task.status === 'completed') return false;
    
    // 의존성이 없으면 바로 진행 가능
    if (!task.dependencies || task.dependencies.length === 0) return true;
    
    // 모든 의존성이 완료되었는지 확인
    return task.dependencies.every(depId => {
      const dependentTask = tasksData.tasks.find(t => t.id === depId);
      return dependentTask && (dependentTask.status === 'done' || dependentTask.status === 'completed');
    });
  };

  // subtask의 의존성이 완료되지 않은지 확인
  const hasUncompletedSubtaskDependencies = (subtask, allSubtasks) => {
    if (!subtask.dependencies || subtask.dependencies.length === 0) return false;
    
    return subtask.dependencies.some(depId => {
      // 의존성 ID 파싱 (예: "1.2" 형태에서 실제 subtask ID 추출)
      let actualDepId = depId;
      if (typeof depId === 'string' && depId.includes('.')) {
        actualDepId = parseInt(depId.split('.')[1]);
      }
      
      const dependentSubtask = allSubtasks.find(st => st.id === actualDepId);
      return dependentSubtask && dependentSubtask.status !== 'done' && dependentSubtask.status !== 'completed';
    });
  };

  // subtask가 바로 진행 가능한지 확인
  const isSubtaskReadyToStart = (subtask, allSubtasks) => {
    // 이미 완료된 subtask는 진행 가능 표시하지 않음
    if (subtask.status === 'done' || subtask.status === 'completed') return false;
    
    // 의존성이 없으면 바로 진행 가능
    if (!subtask.dependencies || subtask.dependencies.length === 0) return true;
    
    // 모든 의존성이 완료되었는지 확인
    return subtask.dependencies.every(depId => {
      // 의존성 ID 파싱
      let actualDepId = depId;
      if (typeof depId === 'string' && depId.includes('.')) {
        actualDepId = parseInt(depId.split('.')[1]);
      }
      
      const dependentSubtask = allSubtasks.find(st => st.id === actualDepId);
      return dependentSubtask && (dependentSubtask.status === 'done' || dependentSubtask.status === 'completed');
    });
  };

  // 상태 아이콘
  const getStatusIcon = (status) => {
    switch (status) {
      case 'done':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in-progress':
        return <Play className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'review':
        return <Eye className="w-4 h-4" />;
      case 'deferred':
        return <Pause className="w-4 h-4" />;
      case 'cancelled':
      case 'blocked':
        return <Ban className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // 필터링된 작업 목록
  const filteredTasks = useMemo(() => {
    if (!tasksData?.tasks) return [];
    
    let filtered = tasksData.tasks.filter(task => {
      const matchesStatus = filterStatus.length === 0 || filterStatus.includes(task.status);
      const matchesSearch = searchTerm === '' || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });

    // Status + Dependency 기반 정렬 (항상 적용)
    const currentOrder = manualOrder.length > 0 ? manualOrder : tasksData.tasks.map(t => t.id);
    
    filtered.sort((a, b) => {
      const aIndex = currentOrder.indexOf(a.id);
      const bIndex = currentOrder.indexOf(b.id);
      return aIndex - bIndex;
    });

    return filtered;
  }, [tasksData, filterStatus, searchTerm, manualOrder]);

  // 통계 계산
  const stats = useMemo(() => {
    if (!tasksData?.tasks) return {};
    
    const total = tasksData.tasks.length;
    const done = tasksData.tasks.filter(t => t.status === 'done' || t.status === 'completed').length;
    const inProgress = tasksData.tasks.filter(t => t.status === 'in-progress').length;
    const pending = tasksData.tasks.filter(t => t.status === 'pending').length;
    const review = tasksData.tasks.filter(t => t.status === 'review').length;
    const deferred = tasksData.tasks.filter(t => t.status === 'deferred').length;
    const cancelled = tasksData.tasks.filter(t => t.status === 'cancelled' || t.status === 'blocked').length;

    return {
      total,
      done,
      inProgress,
      pending,
      review,
      deferred,
      cancelled,
      completionRate: total > 0 ? Math.round((done / total) * 100) : 0
    };
  }, [tasksData]);

  // 작업 상태 업데이트
  const updateTaskStatus = (taskId, newStatus) => {
    const updatedTasks = tasksData.tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus }
        : task
    );
    setTasksData({ ...tasksData, tasks: updatedTasks });
  };
  
  // 프로젝트별 메모 파일 로드
  const loadProjectMemos = async (project) => {
    if (!project) return;
    
    try {
      const response = await fetch(`/api/load-memo/${project.folderName}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (result.success && result.memos) {
        setTaskMemos(result.memos);
        console.log(`Memos loaded from: ${result.path}`);
      } else {
        // 메모 파일이 없으면 빈 객체로 초기화
        setTaskMemos({});
        console.log(`No task-memo.json found for project: ${project.name}`);
      }
    } catch (error) {
      console.log(`Failed to load memos for project: ${project.name}`, error);
      setTaskMemos({});
    }
  };
  
  // 현재 메모 업데이트 (임시 저장만)
  const handleMemoChange = (memo) => {
    setCurrentMemo(memo);
  };
  
  // 메모 저장 (API를 통해 파일에 저장)
  const saveMemo = async () => {
    console.log('🔄 saveMemo 함수 시작');
    if (!selectedTask) {
      console.log('❌ selectedTask가 없음, 저장 중단');
      return;
    }
    
    const memoKey = selectedTask.id.toString();
    const updatedMemos = {
      ...taskMemos,
      [memoKey]: currentMemo
    };
    
    try {
      const projectName = currentProject ? currentProject.folderName : 'direct_input';
      console.log(`📤 메모 저장 요청 시작 - 프로젝트: ${projectName}, 태스크: ${selectedTask.id}`);
      
      const response = await fetch('/api/save-memo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: projectName,
          memos: updatedMemos
        })
      });
      
      console.log('📥 서버 응답 수신:', response.status, response.statusText);
      const result = await response.json();
      console.log('📄 응답 데이터:', result);
      
      if (result.success) {
        setTaskMemos(updatedMemos);
        setOriginalMemo(currentMemo);
        console.log(`✅ ${result.message}`);
        console.log('🔄 상태 업데이트 완료');
        console.log('📊 저장 후 상태:', {
          currentMemo: currentMemo.slice(0, 50) + '...',
          originalMemo: currentMemo.slice(0, 50) + '...',
          hasUnsavedChanges: currentMemo !== currentMemo // 저장 직후라면 false여야 함
        });
      } else {
        console.error('Failed to save memo:', result.error);
        alert('메모 저장에 실패했습니다: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving memo:', error);
      alert('메모 저장 중 오류가 발생했습니다: ' + error.message);
    }
    console.log('🏁 saveMemo 함수 완료');
  };
  
  // 메모 변경사항이 있는지 확인
  const hasUnsavedChanges = currentMemo !== originalMemo;
  const hasDashboardUnsavedChanges = dashboardMemo !== originalDashboardMemo;
  
  
  // 상태 변경 디버깅용 useEffect
  useEffect(() => {
    console.log('🔍 hasUnsavedChanges 상태 변경:', {
      currentMemo: currentMemo.slice(0, 30) + '...',
      originalMemo: originalMemo.slice(0, 30) + '...',
      hasUnsavedChanges
    });
  }, [hasUnsavedChanges, currentMemo, originalMemo]);

  useEffect(() => {
    console.log('🔍 hasDashboardUnsavedChanges 상태 변경:', {
      dashboardMemo: dashboardMemo.slice(0, 30) + '...',
      originalDashboardMemo: originalDashboardMemo.slice(0, 30) + '...',
      hasDashboardUnsavedChanges
    });
  }, [hasDashboardUnsavedChanges, dashboardMemo, originalDashboardMemo]);

  
  // 대시보드 메모 로드
  const loadDashboardMemo = async () => {
    try {
      const projectName = currentProject ? currentProject.folderName : 'direct_input';
      const response = await fetch(`/api/load-dashboard-memo/${projectName}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (result.success && result.memo) {
        setDashboardMemo(result.memo);
        setOriginalDashboardMemo(result.memo);
        console.log(`Dashboard memo loaded from: ${result.path}`);
      } else {
        setDashboardMemo('');
        setOriginalDashboardMemo('');
        console.log(`No dashboard memo found for project: ${projectName}`);
      }
    } catch (error) {
      const projectName = currentProject ? currentProject.folderName : 'direct_input';
      console.log(`Failed to load dashboard memo for project: ${projectName}`, error);
      setDashboardMemo('');
      setOriginalDashboardMemo('');
    }
  };
  
  // 대시보드 메모 저장
  const saveDashboardMemo = async () => {
    console.log('🔄 saveDashboardMemo 함수 시작');
    try {
      const projectName = currentProject ? currentProject.folderName : 'direct_input';
      console.log(`📤 대시보드 메모 저장 요청 시작 - 프로젝트: ${projectName}`);
      
      const response = await fetch('/api/save-dashboard-memo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: projectName,
          memo: dashboardMemo
        })
      });
      
      console.log('📥 서버 응답 수신:', response.status, response.statusText);
      const result = await response.json();
      console.log('📄 응답 데이터:', result);
      
      if (result.success) {
        setOriginalDashboardMemo(dashboardMemo);
        console.log(`✅ ${result.message}`);
        console.log('🔄 대시보드 메모 상태 업데이트 완료');
        console.log('📊 대시보드 저장 후 상태:', {
          dashboardMemo: dashboardMemo.slice(0, 50) + '...',
          originalDashboardMemo: dashboardMemo.slice(0, 50) + '...',
          hasDashboardUnsavedChanges: dashboardMemo !== dashboardMemo // 저장 직후라면 false여야 함
        });
      } else {
        console.error('Failed to save dashboard memo:', result.error);
        alert('대시보드 메모 저장에 실패했습니다: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving dashboard memo:', error);
      alert('대시보드 메모 저장 중 오류가 발생했습니다: ' + error.message);
    }
    console.log('🏁 saveDashboardMemo 함수 완료');
  };
  
  // 새 프로젝트 추가 함수
  const handleAddProject = async () => {
    if (!newProjectName.trim() || !newProjectPath.trim()) {
      setLoadError('Please enter both project name and path');
      return;
    }
    
    setIsCreatingProject(true);
    try {
      // 폴더명은 프로젝트 이름을 기반으로 생성 (공백을 언더스코어로 변환)
      const folderName = newProjectName.trim().toLowerCase().replace(/\s+/g, '_');
      
      const response = await fetch('/api/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName.trim(),
          folderName: folderName,
          externalPath: newProjectPath.trim()
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Project "${newProjectName}" created successfully at ${result.projectPath}`);
        
        // 프로젝트 목록 새로고침
        await loadAvailableProjects();
        
        // 모달 닫기 및 입력 필드 초기화
        setShowAddProjectModal(false);
        setNewProjectName('');
        setNewProjectPath('');
        setLoadError(null);
        
        // 성공 메시지 (선택적)
        alert(`프로젝트 "${newProjectName}"가 성공적으로 생성되었습니다!\n경로: ${result.projectPath}`);
      } else {
        setLoadError(result.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setLoadError('Failed to create project: ' + error.message);
    } finally {
      setIsCreatingProject(false);
    }
  };
  

  // 토폴로지 정렬 함수 (상태 우선 + 의존성 보조)
  const getTopologicalOrder = (tasks) => {
    // 상태별 우선순위 정의
    const statusOrder = {
      'done': 1,
      'completed': 1,
      'in-progress': 2,
      'review': 3,
      'pending': 4,
      'deferred': 5,
      'blocked': 6,
      'cancelled': 6
    };

    // 상태와 의존성을 모두 고려한 복합 정렬
    const sortedTasks = [...tasks].sort((a, b) => {
      const statusA = statusOrder[a.status] || 7;
      const statusB = statusOrder[b.status] || 7;
      
      // 1차: 상태 우선순위로 정렬
      if (statusA !== statusB) {
        return statusA - statusB;
      }
      
      // 2차: 같은 상태 내에서는 의존성 관계 고려
      // a가 b에 의존하면 b가 먼저
      if (a.dependencies?.includes(b.id)) {
        return 1;
      }
      if (b.dependencies?.includes(a.id)) {
        return -1;
      }
      
      // 3차: 의존성 깊이로 정렬 (의존성이 적은 것이 먼저)
      const depsA = a.dependencies?.length || 0;
      const depsB = b.dependencies?.length || 0;
      if (depsA !== depsB) {
        return depsA - depsB;
      }
      
      // 4차: ID로 정렬 (안정성을 위해)
      return a.id - b.id;
    });

    return sortedTasks.map(task => task.id);
  };

  // Subtask 토폴로지 정렬 함수 (상태 우선 + 의존성 보조)
  const getSubtaskTopologicalOrder = (subtasks) => {
    if (!subtasks || subtasks.length === 0) return [];
    
    // 상태별 우선순위 정의 (메인 태스크와 동일)
    const statusOrder = {
      'done': 1,
      'completed': 1,
      'in-progress': 2,
      'review': 3,
      'pending': 4,
      'deferred': 5,
      'blocked': 6,
      'cancelled': 6
    };

    // 상태와 의존성을 모두 고려한 복합 정렬
    const sortedSubtasks = [...subtasks].sort((a, b) => {
      const statusA = statusOrder[a.status] || 7;
      const statusB = statusOrder[b.status] || 7;
      
      // 1차: 상태 우선순위로 정렬
      if (statusA !== statusB) {
        return statusA - statusB;
      }
      
      // 2차: 같은 상태 내에서는 의존성 관계 고려
      // a가 b에 의존하면 b가 먼저
      if (a.dependencies?.length > 0) {
        for (const depId of a.dependencies) {
          let actualDepId = depId;
          if (typeof depId === 'string' && depId.includes('.')) {
            actualDepId = parseInt(depId.split('.')[1]);
          }
          if (actualDepId === b.id) {
            return 1; // a가 b에 의존하므로 b가 먼저
          }
        }
      }
      if (b.dependencies?.length > 0) {
        for (const depId of b.dependencies) {
          let actualDepId = depId;
          if (typeof depId === 'string' && depId.includes('.')) {
            actualDepId = parseInt(depId.split('.')[1]);
          }
          if (actualDepId === a.id) {
            return -1; // b가 a에 의존하므로 a가 먼저
          }
        }
      }
      
      // 3차: 의존성 깊이로 정렬 (의존성이 적은 것이 먼저)
      const depsA = a.dependencies?.length || 0;
      const depsB = b.dependencies?.length || 0;
      if (depsA !== depsB) {
        return depsA - depsB;
      }
      
      // 4차: ID로 정렬 (안정성을 위해)
      return a.id - b.id;
    });

    return sortedSubtasks;
  };

  // 의존성 기반 정렬 초기화
  const initializeDependencyOrder = () => {
    const dependencyOrder = getTopologicalOrder(tasksData.tasks);
    setManualOrder(dependencyOrder);
  };

  // 수동 정렬 함수
  const moveTask = (taskId, direction) => {
    const currentOrder = manualOrder.length > 0 ? manualOrder : filteredTasks.map(task => task.id);
    const currentIndex = currentOrder.indexOf(taskId);
    
    if (currentIndex === -1) return;

    const newOrder = [...currentOrder];
    if (direction === 'up' && currentIndex > 0) {
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
    } else if (direction === 'down' && currentIndex < newOrder.length - 1) {
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
    }

    setManualOrder(newOrder);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!tasksData ? (
        /* 초기 화면 */
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full mx-4">
            <div className="text-center mb-8">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <div className="flex items-center justify-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">Project Dashboard</h2>
                <a
                  href="https://github.com/chanp5660/task-master-monitoring"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  title="GitHub Repository"
                >
                  <Github className="w-5 h-5" />
                </a>
              </div>
              <p className="text-gray-600 mb-6">Load your project data to start managing tasks</p>
            </div>

            {/* 에러 메시지 표시 */}
            {loadError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Failed to load project</h3>
                    <p className="text-sm text-red-700 mt-1">{loadError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* JSON 직접 입력 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Edit className="w-5 h-5" />
                  Paste JSON Data
                </h3>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder="Paste your JSON data here..."
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                />
                <button
                  onClick={handleJsonSubmit}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Load Project Data
                </button>
              </div>

              {/* 프로젝트 관리 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <ExternalLink className="w-5 h-5" />
                    Available Projects
                  </h3>
                  <button
                    onClick={() => setShowAddProjectModal(true)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Project
                  </button>
                </div>

                {/* 프로젝트 목록 */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {projects.length > 0 ? (
                    projects.map((project) => (
                      <div key={project.id} className={`p-4 rounded-lg hover:bg-gray-100 transition-colors ${project.isExternal ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900">{project.name}</div>
                            <div className="text-sm text-gray-600 mt-1">{project.description}</div>
                            <div className="text-xs text-gray-500 mt-1 font-mono">
                              {project.isExternal ? `🔗 ${project.externalPath}` : `projects/${project.folderName}/`}
                            </div>
                            {project.taskCount !== undefined && (
                              <div className="text-xs text-blue-600 mt-1">📋 {project.taskCount} tasks</div>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <button
                              onClick={() => loadProjectFromPath(project)}
                              disabled={isLoading}
                              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 min-w-[100px] justify-center font-medium"
                            >
                              {isLoading ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  Loading
                                </>
                              ) : (
                                <>
                                  <ExternalLink className="w-4 h-4" />
                                  Connect
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p>No projects available</p>
                      <p className="text-sm mt-1">Check your projects directory</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 메인 대시보드 화면 */
        <>
          {/* 헤더 */}
          <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Project Dashboard</h1>
              {currentProject && (
                <div className="flex items-center gap-2 text-sm bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800 font-medium">{currentProject.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Target className="w-4 h-4" />
                {stats.done}/{stats.total} completed ({stats.completionRate}%)
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/chanp5660/task-master-monitoring"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                title="GitHub Repository"
              >
                <Github className="w-5 h-5" />
              </a>
              {/* 뷰 모드 선택 */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1 rounded text-sm ${
                    viewMode === 'cards' ? 'bg-white shadow-sm' : 'text-gray-600'
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded text-sm ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'
                  }`}
                >
                  List
                </button>
              </div>
              
              {/* 새로고침 / 새 데이터 로드 */}
              <button
                onClick={refreshDashboard}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {currentProject ? 'Refresh' : 'Load New Data'}
              </button>
              
              <button
                onClick={() => setTasksData(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2 transition-colors"
              >
                <X className="w-4 h-4" />
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 진행률 바 */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Progress Overview</h3>
            <span className="text-sm font-medium text-gray-600">{stats.completionRate}% Complete</span>
          </div>
          
          {/* 진행률 바 */}
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div className="flex h-4 rounded-full overflow-hidden">
              <div 
                className="bg-green-500" 
                style={{ width: `${(stats.done / stats.total) * 100}%` }}
              />
              <div 
                className="bg-blue-500" 
                style={{ width: `${(stats.inProgress / stats.total) * 100}%` }}
              />
              <div 
                className="bg-purple-500" 
                style={{ width: `${(stats.review / stats.total) * 100}%` }}
              />
              <div 
                className="bg-yellow-500" 
                style={{ width: `${(stats.deferred / stats.total) * 100}%` }}
              />
              <div 
                className="bg-red-500" 
                style={{ width: `${(stats.cancelled / stats.total) * 100}%` }}
              />
            </div>
          </div>
          
          {/* 범례 */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Done ({stats.done})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>In Progress ({stats.inProgress})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded"></div>
              <span>Pending ({stats.pending})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span>Review ({stats.review})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Deferred ({stats.deferred})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Blocked ({stats.cancelled})</span>
            </div>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-wrap items-center gap-4 h-10">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* 상태 필터 - 컴팩트한 다중 선택 */}
            <div className="relative group">
              <div className="px-4 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer hover:bg-gray-50 min-w-40">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Status Filter {filterStatus.length > 0 && `(${filterStatus.length})`}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              
              {/* 드롭다운 메뉴 */}
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-3">
                  <div className="grid grid-cols-2 gap-2">
                    {['done', 'completed', 'in-progress', 'pending', 'review', 'deferred', 'blocked', 'cancelled'].map(status => (
                      <label key={status} className="flex items-center gap-2 text-sm whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={filterStatus.includes(status)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilterStatus([...filterStatus, status]);
                            } else {
                              setFilterStatus(filterStatus.filter(s => s !== status));
                            }
                          }}
                          className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="capitalize text-xs">{status}</span>
                      </label>
                    ))}
                  </div>
                  {filterStatus.length > 0 && (
                    <button
                      onClick={() => setFilterStatus([])}
                      className="text-xs text-blue-600 hover:text-blue-800 mt-2 w-full text-center py-1 hover:bg-blue-50 rounded"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={initializeDependencyOrder}
              className="px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700"
              title="Sort by Status Priority then Dependencies (Topological Order)"
            >
              📊 Status + Dependency Order
            </button>
          </div>
          
          <div className="mt-3 text-sm text-gray-500">
            Showing {filteredTasks.length} of {stats.total} tasks
          </div>
        </div>

        {/* 작업 목록 */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <div key={task.id} className={`rounded-lg shadow hover:shadow-lg transition-shadow ${
                hasUncompletedDependencies(task) 
                  ? 'bg-red-50 border border-red-200' 
                  : isReadyToStart(task)
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-white'
              }`}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-500">#{task.id}</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                        {getStatusIcon(task.status)}
                        <span className="ml-1 capitalize">{task.status}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></div>
                      <span className="text-xs text-gray-500 capitalize">{task.priority}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{task.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{task.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    {task.dependencies?.length > 0 && (
                      <span>Dependencies: {task.dependencies?.join(', ') || 'None'}</span>
                    )}
                  </div>
                  
                  {task.subtasks && task.subtasks.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Subtasks</span>
                        <span>{task.subtasks.filter(st => st.status === 'done' || st.status === 'completed').length}/{task.subtasks.length}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ 
                            width: `${(task.subtasks.filter(st => st.status === 'done' || st.status === 'completed').length / task.subtasks.length) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedTask(task)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Details
                    </button>
                    <div className="flex flex-col">
                      <button
                        onClick={() => moveTask(task.id, 'up')}
                        disabled={filteredTasks.indexOf(task) === 0}
                        className="px-2 py-1 border border-gray-300 rounded-t text-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Move up"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => moveTask(task.id, 'down')}
                        disabled={filteredTasks.indexOf(task) === filteredTasks.length - 1}
                        className="px-2 py-1 border border-gray-300 rounded-b border-t-0 text-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Move down"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="done">Done</option>
                      <option value="completed">Completed</option>
                      <option value="deferred">Deferred</option>
                      <option value="blocked">Blocked</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dependencies</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className={`${
                      hasUncompletedDependencies(task) 
                        ? 'bg-red-50 hover:bg-red-100 border-l-4 border-red-400' 
                        : isReadyToStart(task)
                          ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-400'
                          : 'hover:bg-gray-50'
                    }`}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">#{task.id}</span>
                            <span className="text-sm font-medium text-gray-900">{task.title}</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                          {getStatusIcon(task.status)}
                          <span className="ml-1 capitalize">{task.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></div>
                          <span className="text-sm text-gray-900 capitalize">{task.priority}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {task.dependencies?.length > 0 ? task.dependencies.join(', ') : '0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2 items-center">
                          <button
                            onClick={() => setSelectedTask(task)}
                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => moveTask(task.id, 'up')}
                            disabled={filteredTasks.indexOf(task) === 0}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Move up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveTask(task.id, 'down')}
                            disabled={filteredTasks.indexOf(task) === filteredTasks.length - 1}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Move down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                            className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="done">Done</option>
                            <option value="completed">Completed</option>
                            <option value="deferred">Deferred</option>
                            <option value="blocked">Blocked</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* 대시보드 메모 영역 */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-500" />
              Project Notes
              {hasDashboardUnsavedChanges && (
                <span className="w-2 h-2 bg-orange-500 rounded-full" title="Unsaved changes"></span>
              )}
            </h3>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                saveDashboardMemo();
              }}
              disabled={!hasDashboardUnsavedChanges}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Notes
            </button>
          </div>
          <textarea
            value={dashboardMemo}
            onChange={(e) => setDashboardMemo(e.target.value)}
            placeholder="프로젝트 전반에 대한 메모를 여기에 작성하세요..."
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm resize-none"
          />
          <div className="mt-2 text-xs text-gray-500">
            {hasDashboardUnsavedChanges ? (
              <span className="text-orange-600">⚠️ 저장되지 않은 변경사항이 있습니다</span>
            ) : (
              currentProject ? 
                `저장 위치: projects/${currentProject.folderName}/dashboard-memo.json` :
                "저장 위치: projects/direct_input/dashboard-memo.json"
            )}
          </div>
        </div>
      </div>

      {/* 작업 상세 모달 */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={`rounded-lg shadow-xl max-w-4xl w-full my-8 max-h-[95vh] overflow-hidden ${
            hasUncompletedDependencies(selectedTask) 
              ? 'bg-red-50 border-2 border-red-200' 
              : isReadyToStart(selectedTask)
                ? 'bg-blue-50 border-2 border-blue-200'
                : 'bg-white'
          }`}>
            {/* 통합된 헤더 */}
            <div className={`px-6 py-6 border-b rounded-t-lg ${
              hasUncompletedDependencies(selectedTask) 
                ? 'bg-red-100' 
                : isReadyToStart(selectedTask)
                  ? 'bg-blue-100'
                  : 'bg-gray-50'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-bold text-gray-500">#{selectedTask.id}</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedTask.status)}`}>
                      {getStatusIcon(selectedTask.status)}
                      <span className="ml-1 capitalize">{selectedTask.status}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(selectedTask.priority)}`}></div>
                      <span className="text-sm text-gray-600 capitalize">{selectedTask.priority} priority</span>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 leading-tight">{selectedTask.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 ml-4 flex-shrink-0"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(95vh - 120px)' }}>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    {/* 기본 정보 카드 */}
                    <div className={`rounded-lg p-4 border ${
                      hasUncompletedDependencies(selectedTask) 
                        ? 'bg-red-100 border-red-300' 
                        : isReadyToStart(selectedTask)
                          ? 'bg-blue-100 border-blue-300'
                          : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Priority:</span>
                          <div className="flex items-center gap-1 mt-1">
                            <div className={`w-3 h-3 rounded-full ${getPriorityColor(selectedTask.priority)}`}></div>
                            <span className="text-gray-900 capitalize">{selectedTask.priority}</span>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Dependencies:</span>
                          <p className="text-gray-900 mt-1">{selectedTask.dependencies?.join(', ') || 'None'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Subtasks:</span>
                          <p className="text-gray-900 mt-1">
                            {selectedTask.subtasks ? 
                              `${selectedTask.subtasks.filter(st => st.status === 'done' || st.status === 'completed').length}/${selectedTask.subtasks.length}` 
                              : '0/0'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-500" />
                        Description
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedTask.description}</p>
                      </div>
                    </div>

                    {selectedTask.details && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-green-500" />
                          Details
                        </h4>
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedTask.details}</div>
                        </div>
                      </div>
                    )}
                    
                    {selectedTask.testStrategy && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          Test Strategy
                        </h4>
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedTask.testStrategy}</div>
                        </div>
                      </div>
                    )}

                    {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Users className="w-5 h-5 text-orange-500" />
                          Subtasks ({selectedTask.subtasks.filter(st => st.status === 'done' || st.status === 'completed').length}/{selectedTask.subtasks.length})
                        </h4>
                        <div className="space-y-3">
                          {getSubtaskTopologicalOrder(selectedTask.subtasks).map((subtask) => (
                            <div key={subtask.id} className={`border rounded-lg p-4 shadow-sm ${
                              hasUncompletedSubtaskDependencies(subtask, selectedTask.subtasks)
                                ? 'bg-red-50 border-red-200'
                                : isSubtaskReadyToStart(subtask, selectedTask.subtasks)
                                  ? 'bg-blue-50 border-blue-200'
                                  : 'bg-white border-gray-200'
                            }`}>
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">#{subtask.id}</span>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(subtask.status)}`}>
                                    {getStatusIcon(subtask.status)}
                                    <span className="ml-1 capitalize">{subtask.status}</span>
                                  </span>
                                  {subtask.dependencies && subtask.dependencies.length > 0 && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-gray-400">depends on:</span>
                                      {subtask.dependencies.map((depId, index) => (
                                        <span key={depId} className="text-xs font-mono text-gray-600 bg-yellow-50 px-1 py-0.5 rounded border border-yellow-200">
                                          #{typeof depId === 'string' && depId.includes('.') ? depId : `${selectedTask.id}.${depId}`}
                                          {index < subtask.dependencies.length - 1 && <span className="text-gray-400">,</span>}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <h5 className="font-medium text-gray-900 mb-2">{subtask.title}</h5>
                              <p className="text-sm text-gray-600 mb-3 leading-relaxed">{subtask.description}</p>
                              {subtask.details && (
                                <div className="bg-gray-50 border-l-4 border-gray-300 pl-4 py-2">
                                  <div className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">
                                    {subtask.details}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="lg:col-span-1">
                    <div className="sticky top-6 space-y-6">
                      {/* 상태 업데이트 */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 text-blue-500" />
                          Update Status
                        </h4>
                        <select
                          value={selectedTask.status}
                          onChange={(e) => {
                            updateTaskStatus(selectedTask.id, e.target.value);
                            setSelectedTask({...selectedTask, status: e.target.value});
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="done">Done</option>
                          <option value="completed">Completed</option>
                          <option value="deferred">Deferred</option>
                          <option value="blocked">Blocked</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      
                      {/* 메모 영역 */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-green-500" />
                            Personal Notes
                            {hasUnsavedChanges && (
                              <span className="w-2 h-2 bg-orange-500 rounded-full" title="Unsaved changes"></span>
                            )}
                          </h4>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              saveMemo();
                            }}
                            disabled={!hasUnsavedChanges}
                            className="p-1 text-green-600 hover:text-green-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                            title="Save note"
                          >
                            <Save className="w-3 h-3" />
                          </button>
                        </div>
                        <textarea
                          value={currentMemo}
                          onChange={(e) => handleMemoChange(e.target.value)}
                          placeholder="Add your personal notes here..."
                          className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm resize-none"
                        />
                        <div className="mt-2 text-xs text-gray-500">
                          {hasUnsavedChanges ? (
                            <span className="text-orange-600">⚠️ Unsaved changes - Click save to write to file</span>
                          ) : (
                            currentProject ? 
                              `Notes saved to: projects/${currentProject.folderName}/task-memo.json` :
                              "Notes saved to: projects/direct_input/task-memo.json"
                          )}
                        </div>
                      </div>

                      {selectedTask.dependencies && selectedTask.dependencies.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Target className="w-4 h-4 text-red-500" />
                            Dependencies
                          </h4>
                          <div className="space-y-2">
                            {selectedTask.dependencies.map((depId) => {
                              const depTask = tasksData.tasks.find(t => t.id === depId);
                              return depTask ? (
                                <div key={depId} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded border">
                                  <span className="text-gray-500 font-mono text-xs">#{depId}</span>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(depTask.status)}`}>
                                    {getStatusIcon(depTask.status)}
                                  </span>
                                  <span className="text-gray-900 text-xs leading-tight flex-1">{depTask.title}</span>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* 프로젝트 추가 모달 */}
      {showAddProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-gray-50 px-6 py-4 border-b rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FolderPlus className="w-5 h-5 text-green-500" />
                  Add New Project
                </h3>
                <button
                  onClick={() => {
                    setShowAddProjectModal(false);
                    setNewProjectName('');
                    setNewProjectPath('');
                    setLoadError(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Enter project name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Folder will be created as: {newProjectName ? newProjectName.toLowerCase().replace(/\s+/g, '_') : 'project_name'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tasks.json File Path
                  </label>
                  <input
                    type="text"
                    value={newProjectPath}
                    onChange={(e) => setNewProjectPath(e.target.value)}
                    placeholder="e.g., /path/to/your/project/tasks.json"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Full path to the tasks.json file you want to link
                  </p>
                </div>
                
                {loadError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{loadError}</p>
                  </div>
                )}
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowAddProjectModal(false);
                      setNewProjectName('');
                      setNewProjectPath('');
                      setLoadError(null);
                    }}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddProject}
                    disabled={isCreatingProject || !newProjectName.trim() || !newProjectPath.trim()}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isCreatingProject ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <FolderPlus className="w-4 h-4" />
                        Create Project
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default ProjectDashboard;