# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development Server
- `npm start` - Start development server at http://localhost:3000
- `npm test` - Run tests in watch mode  
- `npm run build` - Build production bundle
- `npm run eject` - Eject from Create React App (one-way operation)

### Testing
- `npm test` - Run all tests with Jest and React Testing Library
- Tests are located in `src/` with `.test.js` suffix

## Project Architecture

This is a React-based project dashboard application for visualizing and managing project tasks. The codebase follows Create React App conventions with additional Tailwind CSS styling.

### Key Components

**Main Application Flow:**
- `src/App.js` - Simple root component that renders ProjectDashboard
- `src/ProjectDashboard.jsx` - Core dashboard component handling all functionality

**ProjectDashboard Component Architecture:**
- **Data Loading**: Supports two input methods:
  1. JSON paste input for direct data entry
  2. File-based project loading from predefined projects in `/public/projects/`
- **Data Structure**: Expects task data in specific JSON format with either `master.tasks` or `tasks` array
- **State Management**: Uses React hooks for local state (tasks, filters, view modes, selected task)
- **Task Display**: Supports card view and list view modes with filtering by status and priority
- **Task Management**: Interactive status updates, detailed task modals with subtasks support

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

### Project File System

- **Static Projects**: Located in `/public/projects/` with `tasks.json` files
- **Predefined Projects**: Hardcoded list in component includes CPUE prediction and test projects
- **Sample Data**: Example task structures available in `/projects/sample-project/tasks.json`

### Styling and UI

- **Framework**: Tailwind CSS for styling
- **Icons**: Lucide React icon library
- **Responsive Design**: Grid layouts adapt to screen sizes
- **Color System**: Status-based color coding (green=done, blue=in-progress, etc.)

### Task Status Workflow

Supported statuses: pending, in-progress, review, done, completed, deferred, blocked, cancelled

Priority levels: critical, high, medium, low

## Development Patterns

### Component Organization
- Single large component approach (ProjectDashboard handles all logic)
- Inline styling with Tailwind classes
- Event handlers defined as arrow functions within component

### State Management
- Local React state with useState hooks
- Derived state using useMemo for filtered data and statistics
- No external state management library

### Data Processing
- Client-side filtering and search
- Real-time statistics calculation
- Task status updates modify state directly

This is a self-contained dashboard application focused on task visualization and management, designed to work with various project task data formats.


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