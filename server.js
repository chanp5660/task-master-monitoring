const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// 미들웨어
app.use(cors());
app.use(express.json());

// 정적 파일 서빙 (React 빌드 파일) - 프로덕션 모드에서만
if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(__dirname, 'build'))) {
  app.use(express.static(path.join(__dirname, 'build')));
}

// 메모 저장 API
app.post('/api/save-memo', (req, res) => {
  try {
    const { project, memos } = req.body;
    
    if (!project || !memos) {
      return res.status(400).json({ error: 'Project and memos are required' });
    }
    
    // 프로젝트 폴더 경로
    const projectPath = path.join(__dirname, 'public', 'projects', project);
    const memoFilePath = path.join(projectPath, 'task-memo.json');
    
    // 폴더가 없으면 생성
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
    }
    
    // 메모 파일 저장
    fs.writeFileSync(memoFilePath, JSON.stringify(memos, null, 2), 'utf8');
    
    console.log(`Memo saved to: ${memoFilePath}`);
    res.json({ 
      success: true, 
      message: `Memo saved to projects/${project}/task-memo.json`,
      path: `projects/${project}/task-memo.json`
    });
    
  } catch (error) {
    console.error('Error saving memo:', error);
    res.status(500).json({ 
      error: 'Failed to save memo', 
      details: error.message 
    });
  }
});

// 메모 로드 API
app.get('/api/load-memo/:project', (req, res) => {
  try {
    const { project } = req.params;
    const memoFilePath = path.join(__dirname, 'public', 'projects', project, 'task-memo.json');
    
    if (fs.existsSync(memoFilePath)) {
      const memoData = fs.readFileSync(memoFilePath, 'utf8');
      const memos = JSON.parse(memoData);
      
      console.log(`Memo loaded from: ${memoFilePath}`);
      res.json({ 
        success: true, 
        memos,
        path: `projects/${project}/task-memo.json`
      });
    } else {
      res.json({ 
        success: false, 
        message: 'No memo file found',
        memos: {}
      });
    }
    
  } catch (error) {
    console.error('Error loading memo:', error);
    res.status(500).json({ 
      error: 'Failed to load memo', 
      details: error.message 
    });
  }
});

// 프로젝트 디렉토리 생성 API
app.post('/api/create-project-dir', (req, res) => {
  try {
    const { project } = req.body;
    
    if (!project) {
      return res.status(400).json({ error: 'Project name is required' });
    }
    
    const projectPath = path.join(__dirname, 'public', 'projects', project);
    
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
      console.log(`Project directory created: ${projectPath}`);
    }
    
    res.json({ 
      success: true, 
      message: `Project directory ready: projects/${project}/`,
      path: `projects/${project}/`
    });
    
  } catch (error) {
    console.error('Error creating project directory:', error);
    res.status(500).json({ 
      error: 'Failed to create project directory', 
      details: error.message 
    });
  }
});

// 프로젝트 목록 스캔 API
app.get('/api/scan-projects', (req, res) => {
  try {
    const projectsPath = path.join(__dirname, 'public', 'projects');
    
    // projects 폴더가 없으면 빈 배열 반환
    if (!fs.existsSync(projectsPath)) {
      return res.json({ 
        success: true, 
        projects: [] 
      });
    }
    
    const projects = [];
    const folders = fs.readdirSync(projectsPath, { withFileTypes: true });
    
    folders.forEach((folder, index) => {
      if (folder.isDirectory()) {
        const folderName = folder.name;
        const tasksJsonPath = path.join(projectsPath, folderName, 'tasks.json');
        
        // tasks.json 파일이 있는 폴더만 유효한 프로젝트로 인식
        if (fs.existsSync(tasksJsonPath)) {
          try {
            // tasks.json에서 프로젝트 정보 읽기
            const tasksData = JSON.parse(fs.readFileSync(tasksJsonPath, 'utf8'));
            
            // 프로젝트 이름은 folder 이름을 기본으로 하되, master.projectName이나 projectName이 있으면 사용
            let projectName = folderName;
            let description = `${folderName} 프로젝트`;
            
            if (tasksData.master?.projectName) {
              projectName = tasksData.master.projectName;
            } else if (tasksData.projectName) {
              projectName = tasksData.projectName;
            }
            
            if (tasksData.master?.description) {
              description = tasksData.master.description;
            } else if (tasksData.description) {
              description = tasksData.description;
            }
            
            projects.push({
              id: index + 1,
              name: projectName,
              folderName: folderName,
              path: `projects/${folderName}/tasks.json`,
              description: description,
              taskCount: tasksData.master?.tasks?.length || tasksData.tasks?.length || 0
            });
            
          } catch (parseError) {
            console.warn(`Failed to parse tasks.json for project ${folderName}:`, parseError.message);
            // JSON 파싱에 실패해도 기본 정보로 프로젝트 추가
            projects.push({
              id: index + 1,
              name: folderName,
              folderName: folderName,
              path: `projects/${folderName}/tasks.json`,
              description: `${folderName} 프로젝트 (파싱 오류)`,
              taskCount: 0
            });
          }
        }
      }
    });
    
    console.log(`Found ${projects.length} projects in ${projectsPath}`);
    res.json({ 
      success: true, 
      projects: projects
    });
    
  } catch (error) {
    console.error('Error scanning projects:', error);
    res.status(500).json({ 
      error: 'Failed to scan projects', 
      details: error.message 
    });
  }
});

// React 앱 서빙 (모든 다른 라우트) - 프로덕션 모드에서만
app.get('*', (_, res) => {
  const buildIndexPath = path.join(__dirname, 'build', 'index.html');
  if (process.env.NODE_ENV === 'production' && fs.existsSync(buildIndexPath)) {
    res.sendFile(buildIndexPath);
  } else {
    res.status(404).send('API server running in development mode. Use React dev server on port 3000.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  POST /api/save-memo - Save memo to file`);
  console.log(`  GET  /api/load-memo/:project - Load memo from file`);
  console.log(`  POST /api/create-project-dir - Create project directory`);
  console.log(`  GET  /api/scan-projects - Scan projects folder for available projects`);
});