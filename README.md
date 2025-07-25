# Task Master AI - 프로젝트 대시보드

React 기반의 프로젝트 작업 관리 대시보드 애플리케이션입니다. 작업 시각화, 상태 관리, 진행률 추적 기능을 제공합니다.

## 주요 기능

### 📊 대시보드 기능
- **작업 시각화**: 카드 뷰와 리스트 뷰로 작업 표시
- **진행률 추적**: 실시간 완료율 및 상태별 통계
- **필터링 & 검색**: 상태, 우선순위별 필터링 및 텍스트 검색
- **정렬 기능**: ID, 제목, 상태, 우선순위, 수동 정렬 지원
- **의존성 기반 정렬**: 작업 간 의존성을 고려한 토폴로지 정렬

### 🔧 작업 관리
- **상태 관리**: pending → in-progress → review → done/completed
- **우선순위**: critical, high, medium, low
- **하위 작업**: 서브태스크 지원 및 진행률 표시
- **의존성 관리**: 작업 간 의존성 추적
- **상세 정보**: 작업 설명, 상세 내용, 테스트 전략 표시

### 📁 데이터 입력 방식
1. **JSON 직접 입력**: 대시보드에서 JSON 데이터 직접 붙여넣기
2. **프로젝트 파일 로드**: `/public/projects/` 폴더의 사전 정의된 프로젝트 로드

## 기술 스택

- **Frontend**: React 19.1.0
- **스타일링**: Tailwind CSS 3.4.17
- **아이콘**: Lucide React 0.525.0
- **빌드 도구**: Create React App
- **테스트**: Jest + React Testing Library

## 설치 및 실행

### 사전 요구사항
- Node.js (권장: v14 이상)
- npm 또는 yarn

### 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm start
```
브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속

### 프로덕션 빌드
```bash
npm run build
```

### 테스트 실행
```bash
npm test
```

## 프로젝트 구조

```
project-dashboard/
├── public/
│   └── projects/              # 프로젝트 데이터 파일
│       ├── cpue_prediction/
│       │   └── tasks.json
│       └── test/
│           └── tasks.json
├── src/
│   ├── App.js                 # 루트 컴포넌트
│   ├── ProjectDashboard.jsx   # 메인 대시보드 컴포넌트
│   └── index.js
├── package.json
└── README.md
```

## 데이터 구조

### 작업 데이터 형식
```json
{
  "master": {
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

### 지원되는 상태
- `pending`: 대기
- `in-progress`: 진행 중
- `review`: 검토
- `done`: 완료
- `completed`: 완성
- `deferred`: 연기
- `blocked`: 차단됨
- `cancelled`: 취소됨

### 우선순위 레벨
- `critical`: 긴급
- `high`: 높음
- `medium`: 보통
- `low`: 낮음

## 사용 방법

### 1. JSON 데이터 입력
1. 대시보드 접속
2. "Paste JSON Data" 영역에 작업 데이터 붙여넣기
3. "Load Project Data" 버튼 클릭

### 2. 프로젝트 파일 로드
1. "Available Projects" 섹션에서 프로젝트 선택
2. "Connect" 버튼 클릭하여 로드

### 3. 작업 관리
- **필터링**: 상태, 우선순위별 필터 적용
- **검색**: 제목이나 설명으로 작업 검색
- **정렬**: 다양한 기준으로 작업 정렬
- **상태 변경**: 카드나 리스트에서 직접 상태 변경
- **상세 보기**: "Details" 버튼으로 작업 상세 정보 확인

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.