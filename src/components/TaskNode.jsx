import React from 'react';
import { Handle, Position } from 'reactflow';
import { CheckCircle, Clock, AlertCircle, Play, Pause, Ban, Eye } from 'lucide-react';

const TaskNode = ({ data }) => {
  const { task } = data;

  // 상태별 색상
  const getStatusColor = (status) => {
    switch (status) {
      case 'done': 
      case 'completed': 
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in-progress': 
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending': 
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'review': 
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'deferred': 
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'cancelled': 
      case 'blocked': 
        return 'bg-red-100 text-red-800 border-red-300';
      default: 
        return 'bg-gray-100 text-gray-800 border-gray-300';
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
        return <CheckCircle className="w-3 h-3" />;
      case 'in-progress':
        return <Play className="w-3 h-3" />;
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'review':
        return <Eye className="w-3 h-3" />;
      case 'deferred':
        return <Pause className="w-3 h-3" />;
      case 'cancelled':
      case 'blocked':
        return <Ban className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  // 진행 가능 여부 확인
  const isReadyToStart = () => {
    if (task.status === 'done' || task.status === 'completed') return false;
    if (!task.dependencies || task.dependencies.length === 0) return true;
    // 의존성 완료 여부는 부모 컴포넌트에서 전달받아야 함
    return data.isReadyToStart || false;
  };

  const hasUncompletedDependencies = () => {
    return data.hasUncompletedDependencies || false;
  };

  return (
    <div 
      className={`relative rounded-lg border-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer min-w-[200px] max-w-[250px] ${
        hasUncompletedDependencies() 
          ? 'bg-red-50 border-red-300' 
          : isReadyToStart()
            ? 'bg-blue-50 border-blue-300'
            : 'bg-white border-gray-200'
      }`}
    >
      {/* 입력 핸들 (상단) */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
      
      {/* 노드 내용 */}
      <div className="p-3">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
              #{task.id}
            </span>
            <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
          </div>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
            {getStatusIcon(task.status)}
            <span className="ml-1 capitalize">{task.status}</span>
          </span>
        </div>

        {/* 제목 */}
        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight">
          {task.title.replace(/^#\d+\s*/, '')}
        </h3>

        {/* 설명 */}
        <p className="text-xs text-gray-600 line-clamp-2 mb-2 leading-relaxed">
          {task.description}
        </p>

        {/* 하단 정보 */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Priority:</span>
            <span className="capitalize font-medium">{task.priority}</span>
          </div>
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="text-gray-500">
              {task.subtasks.filter(st => st.status === 'done' || st.status === 'completed').length}/{task.subtasks.length} subtasks
            </div>
          )}
        </div>

        {/* 의존성 정보 */}
        {task.dependencies && task.dependencies.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Depends on: {task.dependencies.join(', ')}
            </div>
          </div>
        )}

        {/* 상태 표시 */}
        {hasUncompletedDependencies() && (
          <div className="mt-2 text-xs text-red-600 font-medium">
            ⛔ Waiting for dependencies
          </div>
        )}
        {isReadyToStart() && (
          <div className="mt-2 text-xs text-blue-600 font-medium">
            ✅ Ready to start
          </div>
        )}
      </div>

      {/* 출력 핸들 (하단) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
    </div>
  );
};

export default TaskNode;