const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// 미들웨어
app.use(cors());
app.use(express.json());

// 정적 파일 서빙 (React 빌드 파일)
app.use(express.static(path.join(__dirname, 'build')));

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

// React 앱 서빙 (모든 다른 라우트)
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  POST /api/save-memo - Save memo to file`);
  console.log(`  GET  /api/load-memo/:project - Load memo from file`);
  console.log(`  POST /api/create-project-dir - Create project directory`);
});