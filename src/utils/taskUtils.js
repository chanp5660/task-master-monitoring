import { CheckCircle, Play, Clock, Eye, Pause, Ban } from 'lucide-react';

// 상태별 색상 반환
export const getStatusColor = (status) => {
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

// 우선순위별 색상 반환
export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'critical': return 'bg-red-500';
    case 'high': return 'bg-orange-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

// 상태별 아이콘 반환
export const getStatusIcon = (status) => {
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

// 의존성이 완료되지 않은 작업인지 확인
export const hasUncompletedDependencies = (task, allTasks) => {
  if (!task.dependencies || task.dependencies.length === 0) return false;
  
  return task.dependencies.some(depId => {
    const dependentTask = allTasks.find(t => t.id === depId);
    return dependentTask && dependentTask.status !== 'done' && dependentTask.status !== 'completed';
  });
};

// 바로 진행 가능한 작업인지 확인 (모든 의존성이 완료되고 본인은 미완료)
export const isReadyToStart = (task, allTasks) => {
  // 이미 완료된 작업은 진행 가능 표시하지 않음
  if (task.status === 'done' || task.status === 'completed') return false;
  
  // 의존성이 없으면 바로 진행 가능
  if (!task.dependencies || task.dependencies.length === 0) return true;
  
  // 모든 의존성이 완료되었는지 확인
  return task.dependencies.every(depId => {
    const dependentTask = allTasks.find(t => t.id === depId);
    return dependentTask && (dependentTask.status === 'done' || dependentTask.status === 'completed');
  });
};

// subtask의 의존성이 완료되지 않은지 확인
export const hasUncompletedSubtaskDependencies = (subtask, allSubtasks) => {
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
export const isSubtaskReadyToStart = (subtask, allSubtasks) => {
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