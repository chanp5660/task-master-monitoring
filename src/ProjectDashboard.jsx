import React, { useState } from 'react';
import { Search, AlertCircle, BarChart3, Edit, X, FileText, Users, RefreshCw, ExternalLink, ChevronUp, ChevronDown, Plus, FolderPlus, Github, Network, Trash, MessageSquare, Save } from 'lucide-react';
import DiagramView from './components/DiagramView';
import TaskStats from './components/TaskStats';
import TaskDetailModal from './components/TaskDetailModal';
import FilterBar from './components/FilterBar';
import ProjectList from './components/ProjectList';
import DragAndDropProvider from './components/DragAndDropProvider';
import SortableTaskItem from './components/SortableTaskItem';

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

  const refreshDashboard = () => {
    if (projectHook.currentProject && (projectHook.currentProject.path || projectHook.currentProject.externalPath)) {
      handleProjectLoad(projectHook.currentProject);
    } else {
      window.location.reload();
    }
  };

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              {projectHook.currentProject && (
                <div className="text-sm text-gray-600 mb-1">
                  Current Project: <span className="text-blue-800 font-medium">{projectHook.currentProject.name}</span>
                </div>
              )}
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
              
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
                    viewMode === 'cards' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
                    viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  List
                </button>
                <button
                  onClick={() => setViewMode('diagram')}
                  className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
                    viewMode === 'diagram' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                  }`}
                >
                  <Network className="w-4 h-4" />
                  Diagram
                </button>
              </div>
              
              <button
                onClick={refreshDashboard}
                disabled={projectHook.isLoading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${projectHook.isLoading ? 'animate-spin' : ''}`} />
                {projectHook.currentProject ? 'Refresh' : 'Load New Data'}
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
        <TaskStats stats={taskFilterHook.stats} currentProject={projectHook.currentProject} />

        <FilterBar
          searchTerm={taskFilterHook.searchTerm}
          setSearchTerm={taskFilterHook.setSearchTerm}
          filterStatus={taskFilterHook.filterStatus}
          setFilterStatus={taskFilterHook.setFilterStatus}
          onSortByDependency={() => initializeDependencyOrder(tasksData.tasks)}
          filteredTasksCount={taskFilterHook.filteredTasks.length}
          totalTasksCount={taskFilterHook.stats.total}
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
          <DragAndDropProvider
            items={taskFilterHook.filteredTasks}
            onDragEnd={handleDragEnd}
            disabled={viewMode === 'diagram'}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {taskFilterHook.filteredTasks.map((task) => (
                <SortableTaskItem
                  key={task.id}
                  id={task.id}
                  showDragHandle={true}
                  className={`rounded-lg shadow hover:shadow-lg transition-shadow ${
                    hasUncompletedDependencies(task, tasksData.tasks) 
                      ? 'bg-red-50 border border-red-200' 
                      : isReadyToStart(task, tasksData.tasks)
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-white'
                  }`}
                >
                  <div>
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
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{task.title.replace(/^#\d+\s*/, '')}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{task.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    {task.dependencies?.length > 0 && (
                      <span>Dependencies: {renderDependencies(task)}</span>
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
                  
                  <button
                    onClick={() => setSelectedTask(task)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
                  </div>
                </SortableTaskItem>
              ))}
            </div>
          </DragAndDropProvider>
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

      <TaskDetailModal
        selectedTask={selectedTask}
        onClose={() => setSelectedTask(null)}
        tasksData={tasksData}
        getSubtaskTopologicalOrder={getSubtaskTopologicalOrder}
        memoHook={memoHook}
        onTaskSelect={setSelectedTask}
      />
    </div>
  );
};

export default ProjectDashboard;