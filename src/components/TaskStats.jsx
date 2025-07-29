import React from 'react';
import { Target } from 'lucide-react';

const TaskStats = ({ stats, currentProject }) => {
  if (!stats || Object.keys(stats).length === 0) {
    return null;
  }

  return (
    <>
      {/* 헤더의 통계 정보 */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Target className="w-4 h-4" />
        {stats.done}/{stats.total} completed ({stats.completionRate}%)
      </div>

      {/* 진행률 바 섹션 */}
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
    </>
  );
};

export default TaskStats;