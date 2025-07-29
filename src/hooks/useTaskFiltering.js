import { useState, useMemo } from 'react';

const useTaskFiltering = (tasksData, manualOrder) => {
  const [filterStatus, setFilterStatus] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // 필터링된 태스크 목록
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

  return {
    // 상태
    filterStatus,
    searchTerm,
    filteredTasks,
    stats,
    
    // 상태 설정 함수
    setFilterStatus,
    setSearchTerm
  };
};

export default useTaskFiltering;