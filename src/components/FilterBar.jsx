import React from 'react';
import { Search, ChevronDown, BarChart3, Users, Network } from 'lucide-react';

const FilterBar = ({ 
  searchTerm, 
  setSearchTerm, 
  filterStatus, 
  setFilterStatus, 
  onSortByDependency,
  filteredTasksCount,
  totalTasksCount,
  viewMode,
  setViewMode
}) => {
  return (
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
        
        {/* 뷰모드 선택 */}
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
          onClick={onSortByDependency}
          className="px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700"
          title="Sort by Status Priority then Dependencies (Topological Order)"
        >
          📊 Status + Dependency Order
        </button>
      </div>
      
      <div className="mt-3 text-sm text-gray-500">
        Showing {filteredTasksCount} of {totalTasksCount} tasks
      </div>
    </div>
  );
};

export default FilterBar;