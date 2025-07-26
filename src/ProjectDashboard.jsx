import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Calendar, CheckCircle, Clock, AlertCircle, BarChart3, PieChart, Eye, Edit, Save, X, FileText, Users, Target, TrendingUp, Play, Pause, RefreshCw, Ban, Plus, Trash2, ExternalLink, Download, ChevronUp, ChevronDown } from 'lucide-react';

const ProjectDashboard = () => {
  const [tasksData, setTasksData] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('cards');
  const [jsonInput, setJsonInput] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [manualOrder, setManualOrder] = useState([]);
  
  // 프로젝트 관리 상태
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // 페이지 로드 시 사용 가능한 프로젝트 목록 로드
  useEffect(() => {
    loadAvailableProjects();
  }, []);

  // 현재 프로젝트가 경로 기반일 때 새로고침 시 자동 로드
  useEffect(() => {
    if (currentProject && currentProject.path && !tasksData) {
      loadProjectFromPath(currentProject);
    }
  }, [currentProject]);

  // 사용 가능한 프로젝트 목록 로드
  const loadAvailableProjects = () => {
    // projects 폴더 내의 프로젝트들을 정의, 수정 필요
    const availableProjects = [
      {
        id: 1,
        name: 'CPUE 예측',
        folderName: 'cpue_prediction',
        path: 'projects/cpue_prediction/tasks.json',
        description: 'CPUE 예측 프로젝트'
      },
      {
        id: 2,
        name: '테스트',
        folderName: 'test',
        path: 'projects/test/tasks.json',
        description: '테스트 프로젝트'
      }
    ];
    
    setProjects(availableProjects);
  };

  // 경로에서 프로젝트 로드
  const loadProjectFromPath = async (project) => {
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
      // 새 프로젝트 로드 시 수동 정렬 초기화
      setManualOrder([]);
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
    if (currentProject && currentProject.path) {
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
      // JSON 입력 시 수동 정렬 초기화
      setManualOrder([]);
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
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesSearch = searchTerm === '' || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesPriority && matchesSearch;
    });

    // 정렬 로직
    const getSortValue = (task, sortBy) => {
      switch (sortBy) {
        case 'id': return task.id;
        case 'title': return task.title.toLowerCase();
        case 'status': return task.status;
        case 'priority': 
          const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
          return priorityOrder[task.priority] || 0;
        case 'manual':
          const currentOrder = manualOrder.length > 0 ? manualOrder : tasksData.tasks.map(t => t.id);
          return currentOrder.indexOf(task.id);
        default: return task.id;
      }
    };

    filtered.sort((a, b) => {
      const aValue = getSortValue(a, sortBy);
      const bValue = getSortValue(b, sortBy);
      
      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      else if (aValue > bValue) comparison = 1;
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [tasksData, filterStatus, filterPriority, searchTerm, sortBy, sortOrder, manualOrder]);

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

  // Subtask 토폴로지 정렬 함수
  const getSubtaskTopologicalOrder = (subtasks, parentTaskId) => {
    if (!subtasks || subtasks.length === 0) return [];
    
    const subtaskMap = new Map(subtasks.map(subtask => [subtask.id, subtask]));
    const visited = new Set();
    const visiting = new Set();
    const result = [];

    const visit = (subtaskId) => {
      if (visiting.has(subtaskId)) {
        console.warn(`Circular dependency detected in subtask ${subtaskId} of task ${parentTaskId}`);
        return true;
      }
      if (visited.has(subtaskId)) {
        return true;
      }

      visiting.add(subtaskId);
      const subtask = subtaskMap.get(subtaskId);
      
      if (subtask?.dependencies?.length > 0) {
        for (const depId of subtask.dependencies) {
          // 의존성이 문자열 형태인 경우 처리 (예: "9.1")
          let actualDepId = depId;
          if (typeof depId === 'string' && depId.includes('.')) {
            // "9.1" 형태에서 "1"만 추출
            actualDepId = parseInt(depId.split('.')[1]);
          }
          
          if (subtaskMap.has(actualDepId)) {
            visit(actualDepId);
          }
        }
      }

      visiting.delete(subtaskId);
      visited.add(subtaskId);
      result.push(subtaskId); // unshift에서 push로 변경하여 역순으로 정렬
      return true;
    };

    // 모든 subtask에 대해 방문
    for (const subtask of subtasks) {
      if (!visited.has(subtask.id)) {
        visit(subtask.id);
      }
    }

    // 정렬된 ID 순서에 따라 실제 subtask 객체들을 반환
    return result.map(id => subtasks.find(st => st.id === id)).filter(Boolean);
  };

  // 의존성 기반 정렬 초기화
  const initializeDependencyOrder = () => {
    setSortBy('manual');
    const dependencyOrder = getTopologicalOrder(tasksData.tasks);
    setManualOrder(dependencyOrder);
  };

  // 수동 정렬 함수
  const moveTask = (taskId, direction) => {
    if (sortBy !== 'manual') {
      setSortBy('manual');
      // 의존성 기반 토폴로지 정렬로 초기화
      const dependencyOrder = getTopologicalOrder(tasksData.tasks);
      setManualOrder(dependencyOrder);
      return;
    }

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

  if (!tasksData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full mx-4">
          <div className="text-center mb-8">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Dashboard</h2>
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
              </div>

              {/* 프로젝트 목록 */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <div key={project.id} className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">{project.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{project.description}</div>
                        <div className="text-xs text-gray-500 mt-1 font-mono">projects/{project.folderName}/</div>
                      </div>
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
          <div className="flex flex-wrap items-center gap-4">
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
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="done">Done</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="review">Review</option>
              <option value="deferred">Deferred</option>
              <option value="blocked">Blocked</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="id">Sort by ID</option>
              <option value="title">Sort by Title</option>
              <option value="status">Sort by Status</option>
              <option value="priority">Sort by Priority</option>
              <option value="manual">Manual Order</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-gray-50 transition-colors"
              title={`Current: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
            
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
              <div key={task.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
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
                      <span>Dependencies: {task.dependencies.join(', ')}</span>
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
                    {sortBy === 'manual' && (
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
                    )}
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
                    <tr key={task.id} className="hover:bg-gray-50">
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
                          {sortBy === 'manual' && (
                            <>
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
                            </>
                          )}
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
      </div>

      {/* 작업 상세 모달 */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8 max-h-[95vh] overflow-hidden">
            {/* 통합된 헤더 */}
            <div className="bg-gray-50 px-6 py-6 border-b rounded-t-lg">
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
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
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
                          <p className="text-gray-900 mt-1">{selectedTask.dependencies?.length || 0}</p>
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
                          {getSubtaskTopologicalOrder(selectedTask.subtasks, selectedTask.id).map((subtask) => (
                            <div key={subtask.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
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
    </div>
  );
};

export default ProjectDashboard;