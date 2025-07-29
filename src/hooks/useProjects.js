import { useState, useEffect } from 'react';

const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  
  // 프로젝트 추가 모달 상태
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectPath, setNewProjectPath] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  
  // 프로젝트 삭제 상태
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  // 페이지 로드 시 사용 가능한 프로젝트 목록 로드
  useEffect(() => {
    loadAvailableProjects();
  }, []);

  const loadAvailableProjects = async () => {
    try {
      // 일반 프로젝트와 외부 링크 프로젝트를 병렬로 로드
      const [projectsResponse, externalResponse] = await Promise.all([
        fetch('/api/scan-projects', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }),
        fetch('/api/scan-external-links', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      ]);
      
      const projectsResult = await projectsResponse.json();
      const externalResult = await externalResponse.json();
      
      let allProjects = [];
      
      // 일반 프로젝트 추가
      if (projectsResult.success && projectsResult.projects) {
        allProjects = [...projectsResult.projects];
      }
      
      // 외부 링크 프로젝트 추가
      if (externalResult.success && externalResult.externalProjects) {
        allProjects = [...allProjects, ...externalResult.externalProjects];
      }
      
      if (allProjects.length > 0) {
        setProjects(allProjects);
        console.log(`Found ${allProjects.length} projects (${projectsResult.projects?.length || 0} local, ${externalResult.externalProjects?.length || 0} external)`);
      } else {
        console.warn('No projects found, using fallback');
        // 백업용 하드코딩된 프로젝트 목록
        const fallbackProjects = [
          {
            id: 1,
            name: 'CPUE 예측(데이터셋 구축)',
            folderName: 'cpue_prediction_dataset',
            path: 'projects/cpue_prediction_dataset/tasks.json',
            description: 'CPUE 예측 프로젝트(데이터셋 구축)'
          },
          {
            id: 2,
            name: '테스트',
            folderName: 'test',
            path: 'projects/test/tasks.json',
            description: '테스트 프로젝트'
          }
        ];
        setProjects(fallbackProjects);
      }
    } catch (error) {
      console.error('Error scanning projects:', error);
      // 네트워크 오류 시 백업용 프로젝트 목록 사용
      const fallbackProjects = [
        {
          id: 1,
          name: 'CPUE 예측(데이터셋 구축)',
          folderName: 'cpue_prediction_dataset',
          path: 'projects/cpue_prediction_dataset/tasks.json',
          description: 'CPUE 예측 프로젝트(데이터셋 구축)'
        },
        {
          id: 2,
          name: '테스트',
          folderName: 'test',
          path: 'projects/test/tasks.json',
          description: '테스트 프로젝트'
        }
      ];
      setProjects(fallbackProjects);
      setLoadError('Failed to automatically scan projects. Using default project list.');
    }
  };

  // 외부 경로에서 프로젝트 로드
  const loadExternalProject = async (project) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      console.log(`Loading external project from: ${project.externalPath}`);
      
      const response = await fetch('/api/load-external-path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          externalPath: project.externalPath
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load external project');
      }
      
      const data = result.data;
      
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
      
      setCurrentProject(project);
      console.log(`External project "${project.name}" loaded successfully from ${result.path}!`);
      
      return tasksToSet;
    } catch (error) {
      console.error('Load external project error:', error);
      setLoadError(`Failed to load external project: ${error.message}`);
      setCurrentProject(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 경로에서 프로젝트 로드
  const loadProjectFromPath = async (project) => {
    // 외부 링크 프로젝트인 경우 별도 처리
    if (project.isExternal && project.externalPath) {
      return loadExternalProject(project);
    }
    
    setIsLoading(true);
    setLoadError(null);
    try {
      // 경로 정규화 - 상대 경로나 절대 경로 처리
      let fetchPath = project.path;
      
      // 상대 경로인 경우 현재 도메인 기준으로 변환
      if (fetchPath.startsWith('./')) {
        fetchPath = fetchPath.substring(2);
      } else if (fetchPath.startsWith('/')) {
        fetchPath = fetchPath.substring(1);
      }
      
      console.log(`Loading project from: ${fetchPath}`);
      const response = await fetch(fetchPath);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
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
      
      setCurrentProject(project);
      console.log(`Project "${project.name}" loaded successfully!`);
      
      return tasksToSet;
    } catch (error) {
      console.error('Load project error:', error);
      setLoadError(`Failed to load project: ${error.message}`);
      setCurrentProject(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProject = async () => {
    if (!newProjectName.trim() || !newProjectPath.trim()) {
      setLoadError('Please enter both project name and path');
      return;
    }
    
    setIsCreatingProject(true);
    try {
      // 폴더명은 프로젝트 이름을 기반으로 생성 (공백을 언더스코어로 변환)
      const folderName = newProjectName.trim().toLowerCase().replace(/\s+/g, '_');
      
      const response = await fetch('/api/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName.trim(),
          folderName: folderName,
          externalPath: newProjectPath.trim()
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Project "${newProjectName}" created successfully at ${result.projectPath}`);
        
        // 프로젝트 목록 새로고침
        await loadAvailableProjects();
        
        // 모달 닫기 및 입력 필드 초기화
        setShowAddProjectModal(false);
        setNewProjectName('');
        setNewProjectPath('');
        setLoadError(null);
        
        // 성공 메시지 (선택적)
        alert(`프로젝트 "${newProjectName}"가 성공적으로 생성되었습니다!\n경로: ${result.projectPath}`);
      } else {
        setLoadError(result.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setLoadError('Failed to create project: ' + error.message);
    } finally {
      setIsCreatingProject(false);
    }
  };
  
  // 프로젝트 삭제 요청 (첫 번째 확인)
  const handleDeleteProject = (project) => {
    setProjectToDelete(project);
    setShowDeleteConfirmModal(true);
    setDeleteConfirmText('');
  };
  
  // 프로젝트 삭제 확인 및 실행 (두 번째 확인)
  const confirmDeleteProject = async () => {
    if (!projectToDelete || deleteConfirmText !== projectToDelete.name) {
      return;
    }
    
    setIsDeletingProject(true);
    try {
      const response = await fetch('/api/delete-project', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: projectToDelete.id,
          folderName: projectToDelete.folderName
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Project "${projectToDelete.name}" deleted successfully`);
        
        // 프로젝트 목록에서 제거
        setProjects(prevProjects => prevProjects.filter(p => p.id !== projectToDelete.id));
        
        // 현재 로드된 프로젝트가 삭제된 프로젝트라면 초기화
        if (currentProject && currentProject.id === projectToDelete.id) {
          setCurrentProject(null);
        }
        
        // 모달 닫기
        setShowDeleteConfirmModal(false);
        setProjectToDelete(null);
        setDeleteConfirmText('');
        
        alert(`프로젝트 "${projectToDelete.name}"가 성공적으로 삭제되었습니다.`);
        
        return true; // 삭제 성공 표시
      } else {
        console.error('Failed to delete project:', result.error);
        alert('프로젝트 삭제에 실패했습니다: ' + result.error);
        return false;
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('프로젝트 삭제 중 오류가 발생했습니다: ' + error.message);
      return false;
    } finally {
      setIsDeletingProject(false);
    }
  };

  return {
    // 상태
    projects,
    currentProject,
    isLoading,
    loadError,
    showAddProjectModal,
    newProjectName,
    newProjectPath,
    isCreatingProject,
    showDeleteConfirmModal,
    projectToDelete,
    deleteConfirmText,
    isDeletingProject,
    
    // 상태 설정 함수
    setCurrentProject,
    setLoadError,
    setShowAddProjectModal,
    setNewProjectName,
    setNewProjectPath,
    setShowDeleteConfirmModal,
    setProjectToDelete,
    setDeleteConfirmText,
    
    // 액션 함수
    loadAvailableProjects,
    loadProjectFromPath,
    handleAddProject,
    handleDeleteProject,
    confirmDeleteProject
  };
};

export default useProjects;