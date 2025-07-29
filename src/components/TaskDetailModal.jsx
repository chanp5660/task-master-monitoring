import React, { useState } from 'react';
import { BarChart3, Save, X, ChevronDown, MessageSquare } from 'lucide-react';
import { getStatusColor, getPriorityColor, getStatusIcon, hasUncompletedDependencies, isReadyToStart, hasUncompletedSubtaskDependencies, isSubtaskReadyToStart } from '../utils/taskUtils';

const TaskDetailModal = ({ 
  selectedTask, 
  onClose, 
  tasksData, 
  getSubtaskTopologicalOrder,
  memoHook 
}) => {
  const [expandedSubtasks, setExpandedSubtasks] = useState({});

  const toggleSubtaskExpansion = (subtaskId) => {
    setExpandedSubtasks(prev => ({
      ...prev,
      [subtaskId]: !prev[subtaskId]
    }));
  };

  if (!selectedTask) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* 모달 헤더 - 고정 */}
          <div className="sticky top-0 bg-white z-10 border-b border-gray-200 pb-4 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{selectedTask.title}</h2>
                <div className="flex items-center gap-4">
                  <div className="text-lg font-medium text-gray-600">Task #{selectedTask.id}</div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedTask.status)}`}>
                    {getStatusIcon(selectedTask.status)}
                    <span className="ml-1 capitalize">{selectedTask.status}</span>
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(selectedTask.priority)}`}></div>
                    <span className="text-sm text-gray-600 capitalize">{selectedTask.priority} Priority</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 ml-4 flex-shrink-0"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* 작업 설명 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedTask.description}</p>
            </div>
          </div>

          {/* 의존성 */}
          {selectedTask.dependencies && selectedTask.dependencies.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Dependencies</h3>
              <div className="grid gap-2">
                {selectedTask.dependencies.map((depId) => {
                  const depTask = tasksData.tasks.find(t => t.id === depId);
                  return depTask ? (
                    <div key={depId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(depTask.status)}`}>
                        {getStatusIcon(depTask.status)}
                        <span className="ml-1">{depTask.status}</span>
                      </span>
                      <span className="font-medium">{depTask.title}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* 세부사항 */}
          {selectedTask.details && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-500" />
                Details
              </h4>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedTask.details}</div>
              </div>
            </div>
          )}

          {/* 서브태스크 */}
          {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Subtasks</h3>
                <span className="text-lg font-medium text-gray-600">
                  {selectedTask.subtasks.filter(st => st.status === 'done' || st.status === 'completed').length}/{selectedTask.subtasks.length}
                </span>
              </div>
              <div className="space-y-3">
                {getSubtaskTopologicalOrder(selectedTask.subtasks).map((subtask) => (
                  <div key={subtask.id} className={`border rounded-lg ${
                    hasUncompletedSubtaskDependencies(subtask, selectedTask.subtasks) 
                      ? 'bg-red-50 border-red-200' 
                      : isSubtaskReadyToStart(subtask, selectedTask.subtasks)
                        ? 'bg-blue-50 border-blue-200'
                        : 'border-gray-200'
                  }`}>
                    <div 
                      className="flex items-center gap-3 p-3 cursor-pointer hover:bg-opacity-80"
                      onClick={() => toggleSubtaskExpansion(subtask.id)}
                    >
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(subtask.status)}`}>
                        {getStatusIcon(subtask.status)}
                        <span className="ml-1 capitalize">{subtask.status}</span>
                      </span>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{subtask.title}</div>
                        {!expandedSubtasks[subtask.id] && (
                          <div className="text-sm text-gray-600 truncate">{subtask.description}</div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 text-xs">
                          {hasUncompletedSubtaskDependencies(subtask, selectedTask.subtasks) && (
                            <span className="text-orange-500">Blocked</span>
                          )}
                          {isSubtaskReadyToStart(subtask, selectedTask.subtasks) && (
                            <span className="text-green-500">Ready</span>
                          )}
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                          expandedSubtasks[subtask.id] ? 'rotate-180' : ''
                        }`} />
                      </div>
                    </div>
                    
                    {expandedSubtasks[subtask.id] && (
                      <div className="px-3 pb-3 border-t border-gray-200 bg-white bg-opacity-50">
                        <div className="pt-3 space-y-3">
                          {/* 상세 설명 */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{subtask.description}</p>
                          </div>
                          
                          {/* 의존성 */}
                          {subtask.dependencies && subtask.dependencies.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Dependencies</h4>
                              <div className="flex flex-wrap gap-1">
                                {subtask.dependencies.map((depId) => (
                                  <span key={depId} className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                                    #{typeof depId === 'string' && depId.includes('.') ? depId.split('.')[1] : depId}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* 세부사항 */}
                          {subtask.details && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Details</h4>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{subtask.details}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 메모 섹션 */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                Memo
              </h4>
              {memoHook.isMemoModified && (
                <button
                  onClick={memoHook.saveMemo}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm inline-flex items-center gap-1 transition-colors"
                >
                  <Save className="w-3 h-3" />
                  Save
                </button>
              )}
            </div>
            <textarea
              value={memoHook.currentMemo}
              onChange={(e) => memoHook.handleMemoChange(e.target.value)}
              placeholder="Add your notes here..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;