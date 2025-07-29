const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

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

// 대시보드 메모 저장 API
app.post('/api/save-dashboard-memo', (req, res) => {
  try {
    const { project, memo } = req.body;
    
    if (!project || memo === undefined) {
      return res.status(400).json({ error: 'Project and memo are required' });
    }
    
    // 프로젝트 폴더 경로
    const projectPath = path.join(__dirname, 'public', 'projects', project);
    const dashboardMemoFilePath = path.join(projectPath, 'dashboard-memo.json');
    
    // 폴더가 없으면 생성
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
    }
    
    // 대시보드 메모 파일 저장
    fs.writeFileSync(dashboardMemoFilePath, JSON.stringify({ memo }, null, 2), 'utf8');
    
    console.log(`Dashboard memo saved to: ${dashboardMemoFilePath}`);
    res.json({ 
      success: true, 
      message: `Dashboard memo saved to projects/${project}/dashboard-memo.json`,
      path: `projects/${project}/dashboard-memo.json`
    });
    
  } catch (error) {
    console.error('Error saving dashboard memo:', error);
    res.status(500).json({ 
      error: 'Failed to save dashboard memo', 
      details: error.message 
    });
  }
});

// 대시보드 메모 로드 API
app.get('/api/load-dashboard-memo/:project', (req, res) => {
  try {
    const { project } = req.params;
    const dashboardMemoFilePath = path.join(__dirname, 'public', 'projects', project, 'dashboard-memo.json');
    
    if (fs.existsSync(dashboardMemoFilePath)) {
      const memoData = fs.readFileSync(dashboardMemoFilePath, 'utf8');
      const { memo } = JSON.parse(memoData);
      
      console.log(`Dashboard memo loaded from: ${dashboardMemoFilePath}`);
      res.json({ 
        success: true, 
        memo,
        path: `projects/${project}/dashboard-memo.json`
      });
    } else {
      res.json({ 
        success: false, 
        message: 'No dashboard memo file found',
        memo: ''
      });
    }
    
  } catch (error) {
    console.error('Error loading dashboard memo:', error);
    res.status(500).json({ 
      error: 'Failed to load dashboard memo', 
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

// 외부 경로에서 데이터 로드 API
app.post('/api/load-external-path', (req, res) => {
  try {
    const { externalPath } = req.body;
    
    if (!externalPath) {
      return res.status(400).json({ error: 'External path is required' });
    }
    
    // 절대 경로인지 확인
    const absolutePath = path.isAbsolute(externalPath) ? externalPath : path.resolve(externalPath);
    
    // 파일 존재 여부 확인
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ 
        error: 'File not found', 
        path: absolutePath 
      });
    }
    
    // 파일 읽기
    const fileContent = fs.readFileSync(absolutePath, 'utf8');
    
    // JSON 파싱 시도
    let data;
    try {
      data = JSON.parse(fileContent);
    } catch (parseError) {
      return res.status(400).json({ 
        error: 'Invalid JSON format', 
        details: parseError.message,
        path: absolutePath
      });
    }
    
    console.log(`External data loaded from: ${absolutePath}`);
    res.json({ 
      success: true, 
      data: data,
      path: absolutePath
    });
    
  } catch (error) {
    console.error('Error loading external data:', error);
    res.status(500).json({ 
      error: 'Failed to load external data', 
      details: error.message 
    });
  }
});

// 외부 경로 링크 파일 스캔 API (txt 파일에서 경로 읽기)
app.get('/api/scan-external-links', (req, res) => {
  try {
    const projectsPath = path.join(__dirname, 'public', 'projects');
    
    if (!fs.existsSync(projectsPath)) {
      return res.json({ 
        success: true, 
        externalProjects: [] 
      });
    }
    
    const externalProjects = [];
    const folders = fs.readdirSync(projectsPath, { withFileTypes: true });
    
    folders.forEach((folder, index) => {
      if (folder.isDirectory()) {
        const folderName = folder.name;
        const linkFilePath = path.join(projectsPath, folderName, 'path.txt');
        
        // path.txt 파일이 있는 폴더는 외부 링크 프로젝트로 인식
        if (fs.existsSync(linkFilePath)) {
          try {
            const externalPath = fs.readFileSync(linkFilePath, 'utf8').trim();
            
            if (externalPath && fs.existsSync(externalPath)) {
              // 외부 경로의 데이터를 미리 읽어서 프로젝트 정보 추출
              try {
                const tasksData = JSON.parse(fs.readFileSync(externalPath, 'utf8'));
                
                let projectName = folderName;
                let description = `${folderName} 프로젝트 (외부 링크)`;
                
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
                
                externalProjects.push({
                  id: `ext_${index + 1}`,
                  name: `${projectName} 🔗`,
                  folderName: folderName,
                  externalPath: externalPath,
                  description: `${description} (링크: ${externalPath})`,
                  taskCount: tasksData.master?.tasks?.length || tasksData.tasks?.length || 0,
                  isExternal: true
                });
              } catch (parseError) {
                // JSON 파싱 실패 시에도 기본 정보로 추가
                externalProjects.push({
                  id: `ext_${index + 1}`,
                  name: `${folderName} 🔗`,
                  folderName: folderName,
                  externalPath: externalPath,
                  description: `${folderName} 프로젝트 (외부 링크, 파싱 오류)`,
                  taskCount: 0,
                  isExternal: true
                });
              }
            }
          } catch (readError) {
            console.warn(`Failed to read path.txt for ${folderName}:`, readError.message);
          }
        }
      }
    });
    
    console.log(`Found ${externalProjects.length} external link projects`);
    res.json({ 
      success: true, 
      externalProjects: externalProjects
    });
    
  } catch (error) {
    console.error('Error scanning external links:', error);
    res.status(500).json({ 
      error: 'Failed to scan external links', 
      details: error.message 
    });
  }
});

// 프로젝트 생성 API (폴더 생성 + path.txt 파일 생성)
app.post('/api/create-project', (req, res) => {
  try {
    const { name, folderName, externalPath } = req.body;
    
    if (!name || !folderName || !externalPath) {
      return res.status(400).json({ 
        error: 'Name, folderName, and externalPath are required' 
      });
    }
    
    // 프로젝트 폴더 경로
    const projectPath = path.join(__dirname, 'public', 'projects', folderName);
    const pathFilePath = path.join(projectPath, 'path.txt');
    
    // 폴더가 이미 존재하는지 확인
    if (fs.existsSync(projectPath)) {
      return res.status(409).json({ 
        error: 'Project folder already exists',
        folderName: folderName 
      });
    }
    
    // 외부 경로가 유효한지 확인
    if (!fs.existsSync(externalPath)) {
      return res.status(400).json({ 
        error: 'External path does not exist',
        externalPath: externalPath 
      });
    }
    
    // tasks.json인지 확인
    if (!externalPath.endsWith('.json') && !externalPath.endsWith('tasks.json')) {
      return res.status(400).json({ 
        error: 'External path must point to a JSON file (preferably tasks.json)',
        externalPath: externalPath 
      });
    }
    
    // JSON 파일이 올바른 형식인지 확인
    try {
      const testData = JSON.parse(fs.readFileSync(externalPath, 'utf8'));
      if (!testData.tasks && !testData.master?.tasks) {
        return res.status(400).json({ 
          error: 'JSON file must contain "tasks" array or "master.tasks" array',
          externalPath: externalPath 
        });
      }
    } catch (parseError) {
      return res.status(400).json({ 
        error: 'External path does not contain valid JSON',
        externalPath: externalPath,
        details: parseError.message 
      });
    }
    
    // 프로젝트 폴더 생성
    fs.mkdirSync(projectPath, { recursive: true });
    
    // path.txt 파일 생성 (외부 경로 저장)
    fs.writeFileSync(pathFilePath, externalPath, 'utf8');
    
    console.log(`Project "${name}" created successfully:`);
    console.log(`  Folder: ${projectPath}`);
    console.log(`  External path: ${externalPath}`);
    console.log(`  Path file: ${pathFilePath}`);
    
    res.json({ 
      success: true, 
      message: `Project "${name}" created successfully`,
      projectPath: `projects/${folderName}/`,
      pathFile: `projects/${folderName}/path.txt`,
      externalPath: externalPath
    });
    
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ 
      error: 'Failed to create project', 
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
  console.log(`  POST /api/save-dashboard-memo - Save dashboard memo to file`);
  console.log(`  GET  /api/load-dashboard-memo/:project - Load dashboard memo from file`);
  console.log(`  POST /api/create-project-dir - Create project directory`);
  console.log(`  POST /api/create-project - Create new project with external path link`);
  console.log(`  GET  /api/scan-projects - Scan projects folder for available projects`);
  console.log(`  POST /api/load-external-path - Load data from external path`);
  console.log(`  GET  /api/scan-external-links - Scan for external link projects (path.txt files)`);
});