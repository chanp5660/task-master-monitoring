# Task Master AI - 프로젝트 대시보드

React 기반의 고급 프로젝트 작업 관리 대시보드 애플리케이션입니다. 작업 시각화, 상태 관리, 진행률 추적, 메모 기능을 제공하는 풀스택 솔루션입니다.

## 🌟 주요 기능

### 📊 대시보드 기능
- **다중 뷰 모드**: 카드, 리스트, **다이어그램** 뷰로 작업 시각화
- **의존성 다이어그램**: React Flow 기반 태스크 간 의존성 관계 시각화
- **진행률 추적**: 실시간 완료율 및 상태별 통계
- **필터링 & 검색**: 상태, 우선순위별 필터링 및 텍스트 검색  
- **정렬 기능**: ID, 제목, 상태, 우선순위, 수동 정렬 지원
- **의존성 기반 정렬**: 작업 간 의존성을 고려한 스마트 토폴로지 정렬

### 🔧 작업 관리
- **상태 관리**: pending → in-progress → review → done/completed
- **우선순위**: critical, high, medium, low
- **하위 작업**: 서브태스크 지원 및 진행률 표시
- **의존성 관리**: 작업 간 의존성 추적 및 시각적 표시
- **상세 정보**: 작업 설명, 상세 내용, 테스트 전략 표시

### 📝 메모 시스템
- **태스크별 메모**: 각 작업에 개별 메모 작성 및 저장
- **대시보드 메모**: 전체 프로젝트에 대한 종합 메모
- **실시간 저장**: 자동 백엔드 API 연동으로 메모 영구 저장
- **프로젝트별 관리**: 프로젝트마다 독립적인 메모 관리

### 📁 다양한 데이터 입력 방식
1. **JSON 직접 입력**: 대시보드에서 JSON 데이터 직접 붙여넣기
2. **로컬 프로젝트 로드**: `/public/projects/` 폴더의 사전 정의된 프로젝트
3. **외부 경로 연결**: 시스템 내 임의 경로의 JSON 파일 연결
4. **동적 프로젝트 스캔**: 자동 프로젝트 검색 및 목록화

### 🔗 고급 프로젝트 관리
- **프로젝트 생성**: 새 프로젝트 폴더 및 링크 파일 자동 생성
- **외부 링크**: `path.txt`를 통한 외부 JSON 파일 연결
- **GitHub 연동**: 헤더에 GitHub 링크 표시

## 🛠 기술 스택

### Frontend
- **React**: 19.1.0 (최신 버전)
- **Tailwind CSS**: 3.4.17 (반응형 스타일링)
- **Lucide React**: 0.525.0 (아이콘)
- **React Flow**: 11.11.4 (다이어그램 시각화)
- **Dagre**: 0.8.5 (자동 레이아웃 엔진)

### Backend
- **Node.js & Express**: 4.19.2 (API 서버)
- **CORS**: 2.8.5 (교차 출처 리소스 공유)
- **File System**: 로컬 파일 시스템 기반 데이터 저장

### Development & Testing
- **Create React App**: 5.0.1 (빌드 시스템)
- **Jest & React Testing Library**: 테스트 프레임워크
- **Concurrently**: 9.2.0 (개발 서버 동시 실행)

## 🚀 설치 및 실행

### 📦 글로벌 설치 (권장)

#### 설치
```bash
npm install -g task-master-monitoring
```

#### 실행
```bash
# 완전한 명령어
task-master-monitoring

# 간단한 명령어 (별칭)
tmm
```

#### 옵션
```bash
# 기본 포트(3001)로 실행
tmm

# 사용자 정의 포트로 실행
tmm --port 4000

# 도움말 보기
tmm --help

# 버전 정보
tmm --version
```

서버 시작 후 브라우저에서 **http://localhost:3000** 으로 접속하세요.

---

### 🛠 개발자 모드 설치

#### 사전 요구사항
- Node.js (권장: v16 이상)
- npm 또는 yarn

#### 로컬 설치
```bash
git clone <repository-url>
cd project-dashboard
npm install
```

#### 실행 방법

##### 개발 모드 (추천)
```bash
npm run dev
```
- 프론트엔드(3000번 포트)와 백엔드(3001번 포트)를 동시에 실행
- 코드 변경 시 자동 리로드

##### 개별 실행
```bash
# 백엔드만 실행
npm run server

# 프론트엔드만 실행 (다른 터미널에서)
npm start
```

##### 프로덕션 모드
```bash
npm run start:prod
```
- React 앱을 빌드하고 백엔드 서버에서 서빙

##### 테스트 실행
```bash
npm test
```

## 📂 프로젝트 구조

```
project-dashboard/
├── public/
│   ├── projects/                    # 프로젝트 데이터 폴더
│   │   ├── cpue_prediction_dataset/ # CPUE 예측 프로젝트
│   │   │   ├── task-memo.json       # 태스크별 메모
│   │   │   ├── dashboard-memo.json  # 대시보드 메모
│   │   │   └── path.txt            # 외부 경로 링크
│   │   └── test/                   # 테스트 프로젝트
│   │       ├── tasks.json          # 태스크 데이터
│   │       ├── task-memo.json      # 태스크 메모
│   │       └── dashboard-memo.json # 대시보드 메모
│   └── index.html
├── src/
│   ├── components/                 # React 컴포넌트
│   │   ├── DiagramView.jsx         # 다이어그램 뷰 컴포넌트
│   │   └── TaskNode.jsx            # 커스텀 노드 컴포넌트
│   ├── App.js                      # 루트 컴포넌트
│   ├── ProjectDashboard.jsx        # 메인 대시보드 컴포넌트
│   └── index.js
├── server.js                       # Express 백엔드 서버
├── CLAUDE.md                       # Claude Code 설정
├── MEMO_API_GUIDE.md              # 메모 API 가이드
├── package.json
└── README.md
```

## 🔧 API 엔드포인트

### 메모 관리
- **POST** `/api/save-memo` - 태스크별 메모 저장
- **GET** `/api/load-memo/:project` - 태스크별 메모 로드
- **POST** `/api/save-dashboard-memo` - 대시보드 메모 저장
- **GET** `/api/load-dashboard-memo/:project` - 대시보드 메모 로드

### 프로젝트 관리
- **POST** `/api/create-project-dir` - 프로젝트 디렉토리 생성
- **POST** `/api/create-project` - 새 프로젝트 생성 (외부 링크 포함)
- **GET** `/api/scan-projects` - 로컬 프로젝트 스캔
- **GET** `/api/scan-external-links` - 외부 링크 프로젝트 스캔
- **POST** `/api/load-external-path` - 외부 경로에서 데이터 로드

## 📊 데이터 구조

### 작업 데이터 형식
```json
{
  "master": {
    "projectName": "프로젝트 이름",
    "description": "프로젝트 설명",
    "tasks": [
      {
        "id": "1.1",
        "title": "작업 제목",
        "description": "작업 설명",
        "status": "pending",
        "priority": "high",
        "dependencies": ["1.0"],
        "details": "상세 정보",
        "testStrategy": "테스트 전략",
        "subtasks": [
          {
            "id": "1.1.1",
            "title": "하위 작업",
            "description": "하위 작업 설명",
            "status": "done"
          }
        ]
      }
    ]
  }
}
```

### 메모 데이터 구조
```json
{
  "8": "Task 8에 대한 메모",
  "101": "Task 101에 대한 메모",
  "102": "Task 102에 대한 메모"
}
```

### 지원되는 상태
- `pending`: 대기 ⏳
- `in-progress`: 진행 중 🔄
- `review`: 검토 👀
- `done`: 완료 ✅
- `completed`: 완성 🎉
- `deferred`: 연기 ⏸️
- `blocked`: 차단됨 🚫
- `cancelled`: 취소됨 ❌

### 우선순위 레벨
- `critical`: 긴급 🔴
- `high`: 높음 🟠
- `medium`: 보통 🟡
- `low`: 낮음 🟢

## 💻 사용 방법

### 1. JSON 데이터 직접 입력
1. 대시보드 접속 (http://localhost:3000)
2. "Paste JSON Data" 영역에 작업 데이터 붙여넣기
3. "Load Project Data" 버튼 클릭

### 2. 로컬 프로젝트 로드
1. "Available Projects" 섹션에서 프로젝트 선택
2. "Connect" 버튼 클릭하여 로드

### 3. 외부 프로젝트 연결
1. "Create New Project" 섹션에서 프로젝트 정보 입력
2. 외부 JSON 파일 경로 지정
3. 프로젝트 생성 후 자동 연결

![](https://i.imgur.com/510BB2R.gif)

### 4. 작업 관리
- **뷰 모드 전환**: Cards, List, Diagram 세 가지 뷰 모드 지원
- **다이어그램 뷰**: 노드 기반 의존성 시각화 및 자동 레이아웃
- **필터링**: 상태, 우선순위별 필터 적용 (모든 뷰에서 동일 적용)
- **검색**: 제목이나 설명으로 작업 검색
- **정렬**: 다양한 기준으로 작업 정렬 (의존성 기반 포함)
- **상태 변경**: 카드나 리스트에서 직접 상태 변경
- **상세 보기**: "Details" 버튼 또는 다이어그램 노드 클릭으로 작업 상세 정보 확인
- **의존성 탐색**: 작업 상세보기에서 Dependencies와 Subtasks ID 클릭으로 연관 작업 바로 이동

### 5. 메모 활용
- **태스크 메모**: 각 작업 카드에서 메모 아이콘 클릭하여 작성
- **대시보드 메모**: 우측 상단 메모 섹션에서 전체 프로젝트 메모 작성
- **메모 접기/펼치기**: 대시보드 메모 영역 크기 조절 및 토글 기능
- **자동 저장**: 작성한 메모는 백엔드 API를 통해 자동으로 파일에 저장

## 🔄 최근 업데이트 내역 (v1.4.0)

### 🎯 최신 기능 개선 (v1.4.0)
- **Dependencies 연결 기능**: Task 상세보기 모달에서 Dependencies와 Subtasks ID 클릭 시 해당 task 상세보기 모달 열기
- **대시보드 메모 개선**: 대시보드 메모 접기/펼치기 기능 및 동적 높이 조절 추가
- **프로젝트 관리 안정성**: 프로젝트 삭제 모달 취소 버튼 오류 수정
- **시각적 개선**: 작업 상세보기 모달에서 Dependencies와 Subtasks ID 표시 추가

### 🏗️ 아키텍처 개선 (v1.3.0)
- **컴포넌트 모듈화**: ProjectDashboard 코드 구조 개선 및 컴포넌트 분리
- **커스텀 훅 도입**: useProjects, useMemos, useTaskFiltering, useTaskOrder 등 로직 분리
- **유틸리티 함수 체계화**: taskUtils.js, projectUtils.js로 공통 함수 정리
- **사용자 홈 디렉토리 저장**: 프로젝트 데이터 저장 위치 개선
- **포트 설정 유연성**: tmm --port 옵션으로 사용자 정의 포트 지원

### 🌟 핵심 기능 (v1.2.0 이전)
- **다이어그램 뷰 모드**: React Flow 11.11.4 기반 의존성 시각화
- **자동 버전 업데이트 알림**: NPM 패키지 최신 버전 체크 기능
- **초기 화면 UI/UX 개선**: 프로젝트 관리 기능 강화 
- **단순 노드 모드**: 다이어그램 뷰에서 간소화된 노드 표시 토글
- **노드 레이아웃 개선**: Dagre 알고리즘 기반 계층적 자동 배치

### 📝 기반 기능들
- **메모 시스템**: 태스크별/대시보드별 메모 기능 구현
- **백엔드 API 서버**: Express 기반 REST API 서버
- **외부 프로젝트 연결**: path.txt를 통한 외부 JSON 파일 연결
- **프로젝트 자동 스캔**: 동적 프로젝트 검색 및 목록화
- **의존성 기반 정렬**: 스마트 토폴로지 정렬 알고리즘
- **필터링 & 검색**: 상태, 우선순위별 필터 및 텍스트 검색

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여

프로젝트에 기여하고 싶으시다면 GitHub 저장소를 방문해 주세요.