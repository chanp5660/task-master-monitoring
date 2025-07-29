# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development Server
- `npm start` - Start development server at http://localhost:3000
- `npm test` - Run tests in watch mode  
- `npm run build` - Build production bundle
- `npm run eject` - Eject from Create React App (one-way operation)
- `npm run dev` - Start both frontend and backend servers concurrently
- `npm run server` - Start backend server only (port 3001)  
- `npm run start:prod` - Build and serve production bundle

### Testing
- `npm test` - Run all tests with Jest and React Testing Library
- Tests are located in `src/` with `.test.js` suffix

## Project Architecture

This is a React-based project dashboard application (Task Master AI) for visualizing and managing project tasks. The codebase follows Create React App conventions with modular component structure, custom hooks, and Express backend for data persistence.

### Key Components Structure

**Main Application Flow:**
- `src/App.js` - Simple root component that renders ProjectDashboard
- `src/ProjectDashboard.jsx` - Core dashboard component coordinating all functionality
- `server.js` - Express backend server for API endpoints

**Component Architecture:**
- `src/components/DiagramView.jsx` - React Flow based dependency visualization
- `src/components/TaskStats.jsx` - Task statistics and progress tracking
- `src/components/TaskDetailModal.jsx` - Task detail modal with subtasks
- `src/components/FilterBar.jsx` - Filtering and sorting controls  
- `src/components/ProjectList.jsx` - Project management interface
- `src/components/TaskNode.jsx` - Custom React Flow nodes for diagram view

**Custom Hooks:**
- `src/hooks/useProjects.js` - Project loading and management
- `src/hooks/useMemos.js` - Memo system integration  
- `src/hooks/useTaskFiltering.js` - Task filtering and search logic
- `src/hooks/useTaskOrder.js` - Task ordering and dependency sorting

**Utilities:**
- `src/utils/taskUtils.js` - Task status, priority, dependency utilities
- `src/utils/projectUtils.js` - Project data parsing and validation

### Core Features

**Data Loading Methods:**
1. JSON paste input for direct data entry
2. File-based project loading from `/public/projects/`
3. External project linking via `path.txt` files
4. Dynamic project scanning and auto-discovery

**View Modes:**
- **Card View**: Traditional card-based task display
- **List View**: Compact tabular task listing  
- **Diagram View**: Interactive dependency graph with React Flow

**Task Management:**
- Interactive status updates with dependency validation
- Priority-based color coding and filtering
- Subtask support with nested progress tracking
- Dependency-aware topological sorting

### Data Structure Requirements

The application expects JSON data in one of these formats:
```json
{
  "master": {
    "tasks": [...]
  }
}
```
or
```json
{
  "tasks": [...]
}
```

Each task should have: `id`, `title`, `description`, `status`, `priority`, optional `subtasks`, `dependencies`, `details`, `testStrategy`

### Backend API System

**Express Server** (`server.js`):
- **Port**: 3001 (configurable via environment variables)
- **CORS**: Enabled for frontend communication
- **File System**: Local JSON file storage for persistence

**API Endpoints:**
- `POST /api/save-memo` - Save task-specific memos
- `GET /api/load-memo/:project` - Load task memos
- `POST /api/save-dashboard-memo` - Save project-level memos  
- `GET /api/load-dashboard-memo/:project` - Load dashboard memos
- `POST /api/create-project-dir` - Create project directories
- `POST /api/create-project` - Create new projects with external links
- `GET /api/scan-projects` - Scan local projects
- `POST /api/load-external-path` - Load external JSON files

### Project File System

**Local Projects**: Located in `/public/projects/` with following structure:
```
/public/projects/{project-name}/
├── tasks.json              # Task data  
├── task-memo.json          # Task-specific memos
├── dashboard-memo.json     # Project-level memos
└── path.txt               # External file path link (optional)
```

**External Projects**: Linked via `path.txt` containing absolute file paths

### Technology Stack

**Frontend:**
- **React**: 19.1.0 (latest version)
- **Tailwind CSS**: 3.4.17 (responsive styling)
- **Lucide React**: 0.525.0 (icon library)
- **React Flow**: 11.11.4 (diagram visualization)
- **Dagre**: 0.8.5 (automatic graph layout)

**Backend:**
- **Express**: 4.19.2 (web server)
- **CORS**: 2.8.5 (cross-origin support)

**Development:**
- **Concurrently**: 9.2.0 (parallel server execution)
- **Create React App**: 5.0.1 (build system)

### Task Status Workflow

**Supported Statuses:**
- `pending` - 대기 중 (⏳)
- `in-progress` - 진행 중 (🔄)  
- `review` - 검토 중 (👀)
- `done` - 완료 (✅)
- `completed` - 완성 (🎉)
- `deferred` - 연기됨 (⏸️)
- `blocked` - 차단됨 (🚫)
- `cancelled` - 취소됨 (❌)

**Priority Levels:**
- `critical` - 긴급 (🔴)
- `high` - 높음 (🟠)
- `medium` - 보통 (🟡)  
- `low` - 낮음 (🟢)

## Development Patterns

### Component Architecture
- **Modular Design**: Components split by functionality (hooks, utils, components)
- **Custom Hooks**: Logic extraction for reusability (useProjects, useMemos, etc.)
- **Tailwind Styling**: Utility-first CSS with responsive design
- **React Flow Integration**: Advanced diagram visualization with custom nodes

### State Management
- **React Hooks**: useState, useEffect, useMemo for local state
- **Custom Hooks**: Encapsulated business logic and API calls
- **Props Drilling**: State passed through component hierarchy
- **No External Store**: Self-contained state management

### Data Flow
- **API Integration**: RESTful backend communication
- **File Persistence**: JSON files for data storage
- **Real-time Updates**: Immediate UI feedback with backend sync
- **Error Handling**: Graceful degradation and user feedback

This is a comprehensive full-stack dashboard application with advanced task visualization, dependency management, and persistent memo system.


## Git Commit Message Convention

모든 git commit 메시지는 다음 규칙을 따라야 합니다:

### 1. Commit Type
commit type은 아래와 같습니다:
- `feat` (기능): 새로운 기능 추가
- `fix` (수정): 버그 수정
- `style` (스타일): 코드 스타일 변경(코드 의미에 영향을 주지 않는 변경사항)
- `refactor` (리팩토링): 코드 구조 개선
- `comment` (주석): 주석 추가 및 수정
- `docs` (문서): 문서 변경
- `chore` (정리): 기타 작업, 빌드 및 패키지 관리자 설정 변경 등
- `test` (테스트): 테스트 코드 추가

### 2. Commit Message Format
```
<type>: <subject>

<description>
```

- description(부연설명)은 '엔터(줄바꿈) 2번' 후 작성합니다.
- subject는 50자 이내로 작성합니다.
- description은 필요한 경우 상세한 설명을 추가합니다.
- **중요**: Claude Code 서명이나 자동 생성 태그는 추가하지 않습니다.

### 4. 예시
```
feat: 사용자 인증 기능 추가

JWT 기반 인증 시스템을 구현했습니다.
- 로그인/로그아웃 엔드포인트 추가
- 토큰 갱신 로직 구현
- 인증 미들웨어 추가
```

```
docs: 프로젝트 초기화 및 환경 설정 보고서 작성

Task Master AI를 사용한 프로젝트 구조 및 개발 환경 설정 문서화
```

```
feat: Task 2.2 연구 지역 선정 로직 구현 완료

- JSON 직렬화 오류 수정 (numpy 타입을 Python native 타입으로 변환)
- 저장 경로 구조 개선 (analysis 하위 디렉토리 생성)
- Task 2.1과 2.2를 통합된 main 함수로 실행
- 최종 67,773개 격자 선정 완료
- 모든 출력 파일 정상 생성 확인
```