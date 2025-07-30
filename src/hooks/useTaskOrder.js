import { useState } from 'react';

const useTaskOrder = () => {
  const [manualOrder, setManualOrder] = useState([]);

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

  const initializeDependencyOrder = (tasks) => {
    const dependencyOrder = getTopologicalOrder(tasks);
    setManualOrder(dependencyOrder);
  };

  // 수동 정렬 함수
  const moveTask = (taskId, direction, filteredTasks) => {
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

  // Drag & Drop으로 task 순서 변경
  const handleDragEnd = (reorderedTasks) => {
    const newOrder = reorderedTasks.map(task => task.id);
    setManualOrder(newOrder);
  };

  return {
    // 상태
    manualOrder,
    
    // 상태 설정 함수
    setManualOrder,
    
    // 액션 함수
    getTopologicalOrder,
    getSubtaskTopologicalOrder,
    initializeDependencyOrder,
    moveTask,
    handleDragEnd
  };
};

export default useTaskOrder;