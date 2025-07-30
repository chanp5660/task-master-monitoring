import React, { useState } from 'react';
import { Search, AlertCircle, BarChart3, Edit, FileText, Users, ExternalLink, ChevronUp, ChevronDown, Plus, FolderPlus, Github, Network, Trash, MessageSquare, Save, Home, Clock } from 'lucide-react';
import DiagramView from './components/DiagramView';
import TaskStats from './components/TaskStats';
import TaskDetailSidebar from './components/TaskDetailSidebar';
import ResizablePane from './components/ResizablePane';
import FilterBar from './components/FilterBar';
import ProjectList from './components/ProjectList';
import DragAndDropProvider from './components/DragAndDropProvider';
import SortableTaskItem from './components/SortableTaskItem';
import PomodoroTimer from './components/PomodoroTimer';
import PomodoroStatsModal from './components/PomodoroStatsModal';

// 커스텀 훅들
import useProjects from './hooks/useProjects';
import useMemos from './hooks/useMemos';
import useTaskFiltering from './hooks/useTaskFiltering';
import useTaskOrder from './hooks/useTaskOrder';

// 유틸리티 함수들
import { getStatusColor, getPriorityColor, getStatusIcon, hasUncompletedDependencies, isReadyToStart, hasUncompletedSubtaskDependencies, isSubtaskReadyToStart, getUncompletedDependencies, getUncompletedSubtaskDependencies } from './utils/taskUtils';
import { truncateProjectName, parseTasksData } from './utils/projectUtils';

const ProjectDashboard = () => {
  const [tasksData, setTasksData] = useState(null);

  // Dependencies 렌더링 헬퍼 함수 (차단되는 의존성을 빨간색 볼드로 표시)
  const renderDependencies = (task) => {
    if (!task.dependencies || task.dependencies.length === 0) return 'None';
    
    const uncompletedDeps = getUncompletedDependencies(task, tasksData.tasks);
    
    return task.dependencies.map((depId, index) => (
      <span key={depId}>
        {index > 0 && ', '}
        <span className={uncompletedDeps.includes(depId) ? 'text-red-600 font-bold' : ''}>
          {depId}
        </span>
      </span>
    ));
  };
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [jsonInput, setJsonInput] = useState('');
  const [showJsonInputModal, setShowJsonInputModal] = useState(false);
  const [isDashboardMemoCollapsed, setIsDashboardMemoCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(800); // 기본 사이드바 너비를 최대로 설정
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showPomodoroStats, setShowPomodoroStats] = useState(false);
  const [showTimeSettings, setShowTimeSettings] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState('ko-KR');
  const [customLocales, setCustomLocales] = useState([]);

  // 현재 시간 업데이트
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // 로케일 옵션
  const localeOptions = [
    { code: 'ko-KR', name: '한국', timezone: 'Asia/Seoul' },
    { code: 'en-US', name: 'United States', timezone: 'America/New_York' },
    ...customLocales
  ];

  const getCurrentLocaleInfo = () => {
    return localeOptions.find(locale => locale.code === selectedLocale) || localeOptions[0];
  };

  const addCustomLocale = () => {
    const code = prompt('로케일 코드를 입력하세요 (예: ja-JP):');
    const name = prompt('국가명을 입력하세요:');
    const timezone = prompt('타임존을 입력하세요 (예: Asia/Tokyo):');
    
    if (code && name && timezone) {
      setCustomLocales(prev => [...prev, { code, name, timezone }]);
    }
  };

  // 뽀모도로 세션 완료 처리
  const handlePomodoroSessionComplete = async (sessionData) => {
    console.log('Session completed:', sessionData);
    
    if (projectHook.currentProject) {
      try {
        const response = await fetch('/api/save-pomodoro', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            project: projectHook.currentProject.folderName || projectHook.currentProject.name,
            session: sessionData
          })
        });
        
        const result = await response.json();
        if (result.success) {
          console.log('✅ Pomodoro session saved successfully!');
        } else {
          console.error('❌ Failed to save pomodoro session:', result.error);
        }
      } catch (error) {
        console.error('❌ Error saving pomodoro session:', error);
      }
    }
  };

  // 메모 내용에 따른 동적 높이 계산
  const calculateMemoHeight = (memoContent) => {
    if (!memoContent) return 'h-20';
    
    const lines = memoContent.split('\n').length;
    const contentLines = Math.max(lines, Math.ceil(memoContent.length / 80)); // 약 80자 기준
    
    if (contentLines <= 3) return 'h-20';
    if (contentLines <= 6) return 'h-32';
    if (contentLines <= 10) return 'h-48';
    if (contentLines <= 15) return 'h-64';
    return 'h-80';
  };

  // 커스텀 훅 사용
  const projectHook = useProjects();
  const { manualOrder, setManualOrder, getTopologicalOrder, getSubtaskTopologicalOrder, initializeDependencyOrder, moveTask, handleDragEnd } = useTaskOrder();
  const taskFilterHook = useTaskFiltering(tasksData, manualOrder);
  const memoHook = useMemos(projectHook.currentProject, selectedTask, tasksData);

  // 새로고침 핸들러 - F5 및 브라우저 새로고침 버튼 모두 처리
  React.useEffect(() => {
    const handleRefresh = () => {
      if (selectedTask) {
        setSelectedTask(null);
      }
      if (projectHook.currentProject && (projectHook.currentProject.path || projectHook.currentProject.externalPath)) {
        handleProjectLoad(projectHook.currentProject);
      } else {
        window.location.reload();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'F5' || (event.key === 'r' && event.ctrlKey)) {
        event.preventDefault();
        handleRefresh();
      }
    };

    const handleBeforeUnload = (event) => {
      handleRefresh();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [selectedTask, projectHook.currentProject]);

  const handleProjectLoad = async (project) => {
    try {
      const loadedData = await projectHook.loadProjectFromPath(project);
      setTasksData(loadedData);
      // 새 프로젝트 로드 시 상태+의존성 정렬 자동 적용
      const dependencyOrder = getTopologicalOrder(loadedData.tasks);
      setManualOrder(dependencyOrder);
    } catch (error) {
      // 에러는 이미 projectHook에서 처리됨
    }
  };


  const handleJsonModalSubmit = () => {
    projectHook.setLoadError(null);
    try {
      const tasksToSet = parseTasksData(jsonInput);
      setTasksData(tasksToSet);
      projectHook.setCurrentProject(null);
      // 새 데이터 로드 시 상태+의존성 정렬 자동 적용
      const dependencyOrder = getTopologicalOrder(tasksToSet.tasks);
      setManualOrder(dependencyOrder);
      setShowJsonInputModal(false);
      setJsonInput('');
      console.log('✅ JSON data loaded successfully from modal!');
    } catch (error) {
      projectHook.setLoadError(error.message);
    }
  };

  const handleStatusChange = (taskId, newStatus) => {
    setTasksData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    }));
  };

  const handleSubtaskStatusChange = (taskId, subtaskId, newStatus) => {
    setTasksData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => {
        if (task.id === taskId && task.subtasks) {
          return {
            ...task,
            subtasks: task.subtasks.map(subtask =>
              subtask.id === subtaskId ? { ...subtask, status: newStatus } : subtask
            )
          };
        }
        return task;
      })
    }));
  };

  const handleTaskMove = (taskId, direction) => {
    moveTask(taskId, direction, taskFilterHook.filteredTasks);
  };

  // 칸반 보드용 상태별 그룹핑
  const getTasksByColumn = () => {
    const todoStatuses = ['pending', 'deferred', 'blocked'];
    const inProgressStatuses = ['in-progress', 'review'];
    const doneStatuses = ['done', 'completed', 'cancelled'];

    return {
      todo: taskFilterHook.filteredTasks.filter(task => todoStatuses.includes(task.status)),
      inProgress: taskFilterHook.filteredTasks.filter(task => inProgressStatuses.includes(task.status)), 
      done: taskFilterHook.filteredTasks.filter(task => doneStatuses.includes(task.status))
    };
  };

  const kanbanColumns = getTasksByColumn();

  if (!tasksData) {
    return (
      <ProjectList
        projectHook={projectHook}
        onProjectLoad={handleProjectLoad}
        jsonInput={jsonInput}
        setJsonInput={setJsonInput}
        showJsonInputModal={showJsonInputModal}
        setShowJsonInputModal={setShowJsonInputModal}
        onJsonModalSubmit={handleJsonModalSubmit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 transition-all duration-300" style={{ marginRight: selectedTask ? `${sidebarWidth}px` : '0' }}>
          <div className="grid grid-cols-3 items-center">
            {/* 왼쪽: 브랜딩 */}
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-800">TASK MASTER MONITORING</h1>
              {projectHook.currentProject && (
                <div className="text-sm text-gray-500">
                  / <span className="text-blue-600 font-medium">{projectHook.currentProject.name}</span>
                </div>
              )}
            </div>

            {/* 가운데: 뽀모도로 타이머 */}
            <div className="flex justify-center">
              <div className="bg-gray-50 rounded-lg px-4 py-2 border">
                <PomodoroTimer 
                  currentTask={selectedTask}
                  onSessionComplete={handlePomodoroSessionComplete}
                  onShowStats={() => setShowPomodoroStats(true)}
                  onTaskStatusChange={handleStatusChange}
                />
              </div>
            </div>

            {/* 오른쪽: 현재시간 + 도구들 */}
            <div className="flex items-center justify-end gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowTimeSettings(!showTimeSettings)}
                  className="flex flex-col items-end text-sm hover:bg-gray-50 p-2 rounded transition-colors"
                  title="시간대 설정"
                >
                  <div className="font-medium text-gray-800">
                    {currentTime.toLocaleTimeString(selectedLocale, { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit',
                      timeZone: getCurrentLocaleInfo().timezone
                    })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {currentTime.toLocaleDateString(selectedLocale, {
                      year: 'numeric',
                      month: 'short', 
                      day: 'numeric',
                      weekday: 'short',
                      timeZone: getCurrentLocaleInfo().timezone
                    })}
                  </div>
                  <div className="text-xs text-gray-400">
                    {getCurrentLocaleInfo().name}
                  </div>
                </button>
                
                {/* 시간 설정 드롭다운 */}
                {showTimeSettings && (
                  <div className="absolute top-full right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-3 min-w-56">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">시간대 설정</h3>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {localeOptions.map((locale) => (
                        <button
                          key={locale.code}
                          onClick={() => {
                            setSelectedLocale(locale.code);
                            setShowTimeSettings(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-50 ${
                            selectedLocale === locale.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          <div className="font-medium">{locale.name}</div>
                          <div className="text-xs text-gray-500">{locale.code} - {locale.timezone}</div>
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={addCustomLocale}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        + 커스텀 추가
                      </button>
                      
                      <button
                        onClick={() => setShowTimeSettings(false)}
                        className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                      >
                        닫기
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <a
                href="https://github.com/chanp5660/task-master-monitoring"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                title="GitHub Repository"
              >
                <Github className="w-5 h-5" />
              </a>
              
              <button
                onClick={() => setTasksData(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2 transition-colors"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
      <div className="flex-1 transition-all duration-300" style={{ marginRight: selectedTask ? `${sidebarWidth}px` : '0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <TaskStats stats={taskFilterHook.stats} currentProject={projectHook.currentProject} />

        <FilterBar
          searchTerm={taskFilterHook.searchTerm}
          setSearchTerm={taskFilterHook.setSearchTerm}
          filterStatus={taskFilterHook.filterStatus}
          setFilterStatus={taskFilterHook.setFilterStatus}
          onSortByDependency={() => initializeDependencyOrder(tasksData.tasks)}
          filteredTasksCount={taskFilterHook.filteredTasks.length}
          totalTasksCount={taskFilterHook.stats.total}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* 작업 목록 */}
        {viewMode === 'diagram' ? (
          <div className="bg-white rounded-lg shadow">
            <DiagramView 
              tasks={taskFilterHook.filteredTasks}
              onTaskClick={setSelectedTask}
              hasUncompletedDependencies={(task) => hasUncompletedDependencies(task, tasksData.tasks)}
              isReadyToStart={(task) => isReadyToStart(task, tasksData.tasks)}
            />
          </div>
        ) : viewMode === 'cards' ? (
          <div className="bg-white rounded-lg shadow">
            <div className="grid grid-cols-3 gap-6 p-6">
              {/* Todo 열 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">할일</h3>
                  <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-sm font-medium">
                    {kanbanColumns.todo.length}
                  </span>
                </div>
                <DragAndDropProvider
                  items={kanbanColumns.todo}
                  onDragEnd={handleDragEnd}
                  disabled={false}
                  strategy="vertical"
                >
                  <div className="space-y-4">
                    {kanbanColumns.todo.map((task) => (
                      <SortableTaskItem
                        key={task.id}
                        id={task.id}
                        showDragHandle={true}
                        className={`rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer ${
                          hasUncompletedDependencies(task, tasksData.tasks) 
                            ? 'bg-red-50 border border-red-200' 
                            : isReadyToStart(task, tasksData.tasks)
                              ? 'bg-blue-50 border border-blue-200'
                              : 'bg-white'
                        }`}
                      >
                        <div onClick={() => setSelectedTask(task)}>
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-3">
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
                            
                            <h4 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">{task.title.replace(/^#\d+\s*/, '')}</h4>
                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                            
                            {task.dependencies?.length > 0 && (
                              <div className="text-xs text-gray-500 mb-3">
                                Dependencies: {renderDependencies(task)}
                              </div>
                            )}
                            
                            {task.subtasks && task.subtasks.length > 0 && (
                              <div className="mb-3">
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                  <span>Subtasks</span>
                                  <span>{task.subtasks.filter(st => st.status === 'done' || st.status === 'completed').length}/{task.subtasks.length}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-blue-500 h-1.5 rounded-full" 
                                    style={{ 
                                      width: `${(task.subtasks.filter(st => st.status === 'done' || st.status === 'completed').length / task.subtasks.length) * 100}%` 
                                    }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </SortableTaskItem>
                    ))}
                  </div>
                </DragAndDropProvider>
              </div>

              {/* In Progress 열 */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800">진행중</h3>
                  <span className="bg-blue-200 text-blue-700 px-2 py-1 rounded-full text-sm font-medium">
                    {kanbanColumns.inProgress.length}
                  </span>
                </div>
                <DragAndDropProvider
                  items={kanbanColumns.inProgress}
                  onDragEnd={handleDragEnd}
                  disabled={false}
                  strategy="vertical"
                >
                  <div className="space-y-4">
                    {kanbanColumns.inProgress.map((task) => (
                      <SortableTaskItem
                        key={task.id}
                        id={task.id}
                        showDragHandle={true}
                        className={`rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer ${
                          hasUncompletedDependencies(task, tasksData.tasks) 
                            ? 'bg-red-50 border border-red-200' 
                            : isReadyToStart(task, tasksData.tasks)
                              ? 'bg-blue-50 border border-blue-200'
                              : 'bg-white'
                        }`}
                      >
                        <div onClick={() => setSelectedTask(task)}>
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-3">
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
                            
                            <h4 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">{task.title.replace(/^#\d+\s*/, '')}</h4>
                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                            
                            {task.dependencies?.length > 0 && (
                              <div className="text-xs text-gray-500 mb-3">
                                Dependencies: {renderDependencies(task)}
                              </div>
                            )}
                            
                            {task.subtasks && task.subtasks.length > 0 && (
                              <div className="mb-3">
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                  <span>Subtasks</span>
                                  <span>{task.subtasks.filter(st => st.status === 'done' || st.status === 'completed').length}/{task.subtasks.length}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-blue-500 h-1.5 rounded-full" 
                                    style={{ 
                                      width: `${(task.subtasks.filter(st => st.status === 'done' || st.status === 'completed').length / task.subtasks.length) * 100}%` 
                                    }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </SortableTaskItem>
                    ))}
                  </div>
                </DragAndDropProvider>
              </div>

              {/* Done 열 */}
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-green-200">
                  <h3 className="text-lg font-semibold text-green-800">완료</h3>
                  <span className="bg-green-200 text-green-700 px-2 py-1 rounded-full text-sm font-medium">
                    {kanbanColumns.done.length}
                  </span>
                </div>
                <DragAndDropProvider
                  items={kanbanColumns.done}
                  onDragEnd={handleDragEnd}
                  disabled={false}
                  strategy="vertical"
                >
                  <div className="space-y-4">
                    {kanbanColumns.done.map((task) => (
                      <SortableTaskItem
                        key={task.id}
                        id={task.id}
                        showDragHandle={true}
                        className={`rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer ${
                          hasUncompletedDependencies(task, tasksData.tasks) 
                            ? 'bg-red-50 border border-red-200' 
                            : isReadyToStart(task, tasksData.tasks)
                              ? 'bg-blue-50 border border-blue-200'
                              : 'bg-white'
                        }`}
                      >
                        <div onClick={() => setSelectedTask(task)}>
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-3">
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
                            
                            <h4 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">{task.title.replace(/^#\d+\s*/, '')}</h4>
                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                            
                            {task.dependencies?.length > 0 && (
                              <div className="text-xs text-gray-500 mb-3">
                                Dependencies: {renderDependencies(task)}
                              </div>
                            )}
                            
                            {task.subtasks && task.subtasks.length > 0 && (
                              <div className="mb-3">
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                  <span>Subtasks</span>
                                  <span>{task.subtasks.filter(st => st.status === 'done' || st.status === 'completed').length}/{task.subtasks.length}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-blue-500 h-1.5 rounded-full" 
                                    style={{ 
                                      width: `${(task.subtasks.filter(st => st.status === 'done' || st.status === 'completed').length / task.subtasks.length) * 100}%` 
                                    }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </SortableTaskItem>
                    ))}
                  </div>
                </DragAndDropProvider>
              </div>
            </div>
          </div>
        ) : (
          <DragAndDropProvider
            items={taskFilterHook.filteredTasks}
            onDragEnd={handleDragEnd}
            disabled={viewMode === 'diagram'}
          >
            <div className="bg-white rounded-lg shadow">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dependencies</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {taskFilterHook.filteredTasks.map((task) => (
                      <SortableTaskItem
                        key={task.id}
                        id={task.id}
                        as="tr"
                        showDragHandle={true}
                        className={`cursor-pointer group ${
                          hasUncompletedDependencies(task, tasksData.tasks) 
                            ? 'bg-red-50 hover:bg-red-100 border-l-4 border-red-400' 
                            : isReadyToStart(task, tasksData.tasks)
                              ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-400'
                              : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap" onClick={() => setSelectedTask(task)}>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                            {getStatusIcon(task.status)}
                            <span className="ml-1 capitalize">{task.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4" onClick={() => setSelectedTask(task)}>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{task.title.replace(/^#\d+\s*/, '')}</div>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" onClick={() => setSelectedTask(task)}>
                          <span className="text-sm font-medium text-gray-900">#{task.id}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" onClick={() => setSelectedTask(task)}>
                          {task.dependencies?.length > 0 ? renderDependencies(task) : '0'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" onClick={() => setSelectedTask(task)}>
                          <div className="flex items-center gap-1">
                            <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></div>
                            <span className="text-sm text-gray-900 capitalize">{task.priority}</span>
                          </div>
                        </td>
                      </SortableTaskItem>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </DragAndDropProvider>
        )}

        {/* 대시보드 메모 */}
        <div className="mt-6 bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-green-500" />
                Dashboard Memo
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDashboardMemoCollapsed(!isDashboardMemoCollapsed)}
                  className="text-gray-500 hover:text-gray-700 p-1 transition-colors"
                  title={isDashboardMemoCollapsed ? "펼치기" : "접기"}
                >
                  {isDashboardMemoCollapsed ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </button>
                {memoHook.isDashboardMemoModified && (
                  <button
                    onClick={memoHook.saveDashboardMemo}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm inline-flex items-center gap-2 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                )}
              </div>
            </div>
            <textarea
              value={memoHook.dashboardMemo}
              onChange={(e) => memoHook.handleDashboardMemoChange(e.target.value)}
              placeholder="프로젝트 전체 메모, 할 일, 아이디어 등을 기록하세요..."
              className={`w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 ${
                isDashboardMemoCollapsed ? 'h-20' : calculateMemoHeight(memoHook.dashboardMemo)
              }`}
            />
          </div>
        </div>

        </div>
      </div>

      {/* 리사이저블 사이드바 상세보기 */}
      {selectedTask && (
        <ResizablePane
          defaultWidth={sidebarWidth}
          onWidthChange={setSidebarWidth}
          minWidth={280}
          maxWidth={Math.min(800, window.innerWidth * 0.6)}
        >
          <TaskDetailSidebar
            selectedTask={selectedTask}
            onClose={() => setSelectedTask(null)}
            tasksData={tasksData}
            getSubtaskTopologicalOrder={getSubtaskTopologicalOrder}
            memoHook={memoHook}
            onTaskSelect={setSelectedTask}
          />
        </ResizablePane>
      )}
      
      {/* 뽀모도로 통계 모달 */}
      <PomodoroStatsModal
        isOpen={showPomodoroStats}
        onClose={() => setShowPomodoroStats(false)}
        currentProject={projectHook.currentProject}
      />
      </div>
    </div>
  );
};

export default ProjectDashboard;