// 프로젝트명 단축 함수
export const truncateProjectName = (name, screenSize = 'lg') => {
  // 화면 크기별 최대 길이 설정
  const maxLengths = {
    sm: 18,  // 모바일 - 증가
    md: 24,  // 태블릿 - 증가
    lg: 30   // 데스크탑 - 증가
  };
  
  const maxLength = maxLengths[screenSize] || maxLengths.lg;
  
  if (name.length <= maxLength) return name;
  
  // 공백이 있는 경우 단어 단위로 자르기
  if (name.includes(' ')) {
    const words = name.split(' ');
    let truncated = '';
    
    for (let word of words) {
      const nextLength = truncated + (truncated ? ' ' : '') + word;
      if (nextLength.length > maxLength - 3) {
        break;
      }
      truncated += (truncated ? ' ' : '') + word;
    }
    
    return truncated.length > 0 ? truncated + '...' : name.substring(0, maxLength - 3) + '...';
  }
  
  // 언더스코어가 있는 경우 언더스코어 단위로 자르기 시도
  if (name.includes('_')) {
    const parts = name.split('_');
    let truncated = '';
    
    for (let part of parts) {
      const nextLength = truncated + (truncated ? '_' : '') + part;
      if (nextLength.length > maxLength - 3) {
        break;
      }
      truncated += (truncated ? '_' : '') + part;
    }
    
    return truncated.length > 0 ? truncated + '...' : name.substring(0, maxLength - 3) + '...';
  }
  
  // 그 외의 경우 간단히 자르기
  return name.substring(0, maxLength - 3) + '...';
};

// JSON 데이터 파싱 함수
export const parseTasksData = (jsonInput) => {
  if (!jsonInput.trim()) {
    throw new Error('Please enter JSON data');
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
    
    return tasksToSet;
  } catch (error) {
    throw new Error('Invalid JSON format: ' + error.message);
  }
};