# Task Master AI - 프로젝트 대시보드

[![npm version](https://badge.fury.io/js/task-master-monitoring.svg)](https://www.npmjs.com/package/task-master-monitoring)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

React 기반의 고급 프로젝트 작업 관리 대시보드 애플리케이션입니다. 작업 시각화, 상태 관리, 진행률 추적, 메모 기능을 제공하는 풀스택 솔루션입니다.

## 🚀 개발 동기

기존 CLI 기반의 task-master-ai를 사용하면서 겪었던 불편함을 해결하기 위해 개발되었습니다:

### 🔍 **문제점**
- **작업 추가 시 ID 혼란**: 중간에 새로운 작업을 추가하면 ID가 큰 숫자로 할당되어 전체적인 작업 순서 파악이 어려움
- **의존성 관리의 어려움**: 작업 간의 연관관계와 선후 관계를 직관적으로 파악하기 힘듦  
- **진행 상황 추적의 한계**: 현재 해야 할 작업이 전체 흐름에서 어떤 위치에 있는지 명확하지 않음

### 💡 **해결책**
- **지능형 작업 정렬**: 의존성 기반 토폴로지 정렬로 작업을 논리적 순서대로 배치
- **시각적 워크플로우**: 다이어그램 뷰로 작업 흐름과 의존성 관계를 한눈에 파악
- **직관적인 작업 배치**: 새로 추가된 작업도 의존성에 따라 적절한 위치에 자동 배치

이를 통해 **"지금 무엇을 해야 하는가?"** 와 **"이 작업이 전체 프로젝트에서 어떤 의미인가?"** 를 쉽게 파악할 수 있습니다.

## 🎥 시연 영상

[![Task Master Monitoring 시연 영상](https://img.youtube.com/vi/Q2eTvkpq8Ds/maxresdefault.jpg)](https://youtu.be/Q2eTvkpq8Ds)

**[📺 Task Master Monitoring 시연 영상 보기](https://youtu.be/Q2eTvkpq8Ds)**

실제 사용 방법과 주요 기능들을 영상으로 확인해보세요!

## 📑 목차

- [빠른 시작](#-빠른-시작)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [설치 및 실행](#-설치-및-실행)
- [프로젝트 구조](#-프로젝트-구조)
- [사용 방법](#-사용-방법)
- [API 문서](#-api-엔드포인트)
- [데이터 구조](#-데이터-구조)
- [문제 해결](#-문제-해결)
- [FAQ](#-faq)
- [최근 업데이트](#-최근-업데이트-내역-v140)
- [기여하기](#-기여)

## ⚡ 빠른 시작

### 글로벌 설치 (추천)

```bash
# 1. 패키지 설치
npm install -g task-master-monitoring

# 2. 실행
tmm

# 3. 브라우저에서 http://localhost:3000 접속
```

### 개발자 모드

```bash
# 1. 저장소 클론
git clone https://github.com/chanp5660/task-master-monitoring.git
cd task-master-monitoring

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev
```

> **💡 팁**: 첫 실행 시 샘플 JSON 데이터를 붙여넣기하여 즉시 기능을 테스트해보세요!


## 🌟 주요 기능

<table>
<tr>
<td width="50%">

### 📊 **대시보드 시각화**
- 🎯 **3가지 뷰 모드**: Cards, List, Diagram
- 📈 **의존성 다이어그램**: React Flow 기반 시각화
- 📊 **실시간 진행률**: 완료율 및 통계 추적
- 🔍 **스마트 필터링**: 상태/우선순위별 검색
- 🔄 **토폴로지 정렬**: 의존성 기반 자동 정렬

### 🔧 **작업 관리**
- ✅ **상태 워크플로**: pending → done 완료 흐름
- 🚨 **우선순위 체계**: 4단계 우선순위 관리
- 📋 **하위 작업**: 서브태스크 및 진행률 표시
- 🔗 **의존성 추적**: 작업 간 연관관계 관리
- 📝 **상세 정보**: 설명, 테스트 전략 등

</td>
<td width="50%">

### 📝 **메모 시스템**
- 📌 **태스크별 메모**: 개별 작업 메모 관리
- 📋 **대시보드 메모**: 프로젝트 전체 메모
- 💾 **자동 저장**: 실시간 백엔드 동기화
- 🗂️ **프로젝트별 분리**: 독립적 메모 공간

### 📁 **데이터 관리**
- 📝 **JSON 직접 입력**: 즉시 데이터 로드
- 📂 **로컬 프로젝트**: 파일 시스템 연동
- 🔗 **외부 파일 연결**: 시스템 경로 링크
- 🔍 **자동 스캔**: 프로젝트 자동 검색
- ⚙️ **CLI 도구**: 글로벌 명령어 지원

</td>
</tr>
</table>

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

> **참고**: 글로벌 설치 시 사용자 프로젝트 데이터는 `~/.task-master-monitoring/projects/` 디렉토리에 저장됩니다.

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
├── bin/
│   └── tmm.js                      # CLI 실행 파일
├── public/
│   ├── projects/                   # 로컬 프로젝트 데이터 (개발용)
│   │   └── test/                   # 테스트 프로젝트
│   │       ├── tasks.json          # 태스크 데이터
│   │       ├── task-memo.json      # 태스크 메모
│   │       └── dashboard-memo.json # 대시보드 메모
│   └── index.html
├── src/
│   ├── components/                 # React 컴포넌트
│   │   ├── DiagramView.jsx         # 다이어그램 뷰 컴포넌트
│   │   ├── FilterBar.jsx           # 필터링 바 컴포넌트
│   │   ├── ProjectList.jsx         # 프로젝트 목록 컴포넌트
│   │   ├── TaskDetailModal.jsx     # 작업 상세 모달 컴포넌트
│   │   ├── TaskNode.jsx            # 커스텀 노드 컴포넌트
│   │   └── TaskStats.jsx           # 작업 통계 컴포넌트
│   ├── hooks/                      # 커스텀 훅
│   │   ├── useMemos.js             # 메모 관리 훅
│   │   ├── useProjects.js          # 프로젝트 관리 훅
│   │   ├── useTaskFiltering.js     # 태스크 필터링 훅
│   │   └── useTaskOrder.js         # 태스크 정렬 훅
│   ├── utils/                      # 유틸리티 함수
│   │   ├── projectUtils.js         # 프로젝트 관련 유틸리티
│   │   └── taskUtils.js            # 태스크 관련 유틸리티
│   ├── App.js                      # 루트 컴포넌트
│   ├── ProjectDashboard.jsx        # 메인 대시보드 컴포넌트
│   └── index.js
├── server.js                       # Express 백엔드 서버
├── CLAUDE.md                       # Claude Code 설정
├── package.json
└── README.md
```

### 사용자 데이터 디렉토리
글로벌 설치 시 사용자 데이터는 다음 위치에 저장됩니다:
```
~/.task-master-monitoring/
└── projects/                       # 사용자 프로젝트 데이터
    ├── project-name/
    │   ├── tasks.json              # 태스크 데이터
    │   ├── task-memo.json          # 태스크별 메모
    │   ├── dashboard-memo.json     # 대시보드 메모
    │   └── path.txt               # 외부 경로 링크 (선택적)
    └── ...
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
- **GET** `/api/scan-projects` - 사용자 디렉토리 프로젝트 스캔
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

> **참고**: 글로벌 설치 시 사용자 홈 디렉토리(`~/.task-master-monitoring/projects/`)의 프로젝트들이 표시됩니다.

### 3. 외부 프로젝트 연결
1. "Create New Project" 섹션에서 프로젝트 정보 입력
2. 외부 JSON 파일 경로 지정
3. 프로젝트 생성 후 자동 연결

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

## 🔧 문제 해결

### 일반적인 문제들

#### 포트 충돌 문제
```bash
# 다른 포트로 실행
tmm --port 4000
```

#### 프로젝트가 로드되지 않는 경우
1. JSON 형식이 올바른지 확인
2. 브라우저 콘솔에서 오류 메시지 확인
3. 백엔드 서버(3001 포트)가 정상 실행 중인지 확인

#### 메모가 저장되지 않는 경우
- 백엔드 서버 연결 상태 확인
- 파일 쓰기 권한 확인 (홈 디렉토리 `.task-master-monitoring/` 폴더)

#### 의존성 다이어그램이 표시되지 않는 경우
- 작업 데이터에 `dependencies` 필드가 올바르게 설정되어 있는지 확인
- 브라우저를 새로고침하여 React Flow 컴포넌트 재초기화

### 로그 확인
개발 모드에서 문제 발생 시:
```bash
# 브라우저 개발자 도구 콘솔 확인
# 또는 터미널에서 서버 로그 확인
npm run dev
```

## ❓ FAQ

### 🚀 설치 

#### Q: 포트 충돌로 실행이 안 돼요.
A: `tmm --port 4000`처럼 다른 포트를 지정해서 실행하세요. 백엔드는 자동으로 지정된 포트+1을 사용합니다.

### 📊 프로젝트 데이터 관리

#### Q: 어떤 형태의 데이터를 사용할 수 있나요?
A: 다음 세 가지 방법으로 데이터를 사용할 수 있습니다:
- **JSON 직접 입력**: 대시보드에서 바로 붙여넣기
- **tasks.json 파일 연결**: 시스템의 다른 위치에 있는 JSON 파일 링크

#### Q: tasks.json 파일을 어떻게 연결하나요?
A: "Add Project" 섹션에서 프로젝트를 생성할 때 JSON 파일의 절대 경로를 입력하면 자동으로 `path.txt` 파일이 생성되어 연결됩니다.

#### Q: 프로젝트 데이터가 실시간으로 동기화되나요?
A: 메모는 실시간으로 저장되지만, 작업 데이터 자체는 수동으로 다시 로드해야 합니다. 외부 파일을 수정한 후에는 브라우저에서 새로고침하세요. 추후 자동 동기화 기능 추가 예정

### 🔧 기능 사용법

#### Q: 다이어그램 뷰가 복잡해 보여요. 간단하게 볼 수 있나요?
A: 다이어그램 뷰에서 "Simple Node Mode" 토글을 활성화하면 노드가 간소화되어 더 깔끔하게 볼 수 있습니다.

#### Q: 작업 순서를 바꿀 수 있나요?
A: task-master-ai 를 사용해서 직접 변경해야 합니다. 보는 순서는 변경이 가능합니다만, 재접속하거나 "Status + Dependency Order" 버튼 클릭 시 원래 순서로 돌아갑니다.

#### Q: 메모 기능은 어디에 저장되나요?
A: 메모는 프로젝트 폴더(~/.task-master-monitoring/projects/) 내에 저장됩니다. 프로젝트 폴더 내에 `task-memo.json` 파일이 생성되며, 이 파일에 메모가 저장됩니다.

#### Q: 다이어그램 뷰에서 노드 위치를 수동으로 조정 후 저장 가능한가요?
A: 현재는 Dagre 알고리즘에 의한 자동 레이아웃만 지원합니다. 노드를 드래그해서 임시로 위치를 변경할 수 있지만, 새로고침하면 원래 위치로 돌아갑니다. 추후 자동 저장 기능 추가 예정

### 💾 데이터 관리 및 백업

#### Q: 백업은 어떻게 하나요?
A: 사용자 데이터는 `~/.task-master-monitoring/projects/` 디렉토리에 저장되므로, 이 폴더 전체를 백업하면 됩니다. 각 프로젝트별로 `tasks.json`, `task-memo.json`, `dashboard-memo.json` 파일이 포함됩니다.

#### Q: 다른 컴퓨터로 데이터를 옮기려면?
A: 백업한 `~/.task-master-monitoring/projects/` 폴더를 새 컴퓨터의 같은 위치에 복사하면 됩니다.

## 🔄 최근 업데이트 내역 (v1.5.0)

### 🚀 최신 릴리즈 (v1.5.0)
- **📚 문서화 개선**: 완전히 새로워진 README.md 구조
- **⚡ 빠른 시작 가이드**: 즉시 사용 가능한 설치 및 실행 가이드
- **🖼️ 시각적 미리보기**: ASCII 아트 스크린샷으로 UI 레이아웃 표시
- **🔧 문제 해결 섹션**: 일반적인 문제들과 해결 방법 추가
- **❓ FAQ 섹션**: 자주 묻는 질문들과 상세한 답변
- **🎯 향후 계획**: 프로젝트 로드맵 및 개발 방향 제시
- **📊 프로젝트 상태**: GitHub 배지 및 통계 정보 표시

### 🎯 이전 기능 개선 (v1.4.0)
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
- **프로젝트 자동 스캔**: 사용자 홈 디렉토리 기반 프로젝트 검색
- **의존성 기반 정렬**: 스마트 토폴로지 정렬 알고리즘
- **필터링 & 검색**: 상태, 우선순위별 필터 및 텍스트 검색
- **CLI 도구**: 글로벌 설치 및 명령행 인터페이스 지원


## 📄 라이선스

이 프로젝트는 [MIT 라이선스](LICENSE) 하에 배포됩니다.

## 🤝 기여하기

프로젝트에 기여해주신다면 언제나 환영입니다! 

### 기여 방법
1. 🍴 Fork the repository
2. 🌿 Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit your changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. 📤 Push to the branch (`git push origin feature/AmazingFeature`)
5. 🔃 Open a Pull Request

### 버그 리포트 및 기능 제안
- 🐛 [버그 리포트](https://github.com/chanp5660/task-master-monitoring/issues/new?template=bug_report.md)
- 💡 [기능 제안](https://github.com/chanp5660/task-master-monitoring/issues/new?template=feature_request.md)

---

<div align="center">

**⭐ 이 프로젝트가 도움이 되셨다면 Star를 눌러주세요! ⭐**

Made with ❤️ by [chanp5660](https://github.com/chanp5660/task-master-monitoring)

</div>