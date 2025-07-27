# 메모 저장 시스템 가이드

프로젝트 대시보드에 백엔드 API를 통한 메모 저장 기능이 추가되었습니다.

## 🚀 실행 방법

### 개발 모드 (추천)
```bash
npm run dev
```
- 프론트엔드(3000번 포트)와 백엔드(3001번 포트)를 동시에 실행
- 코드 변경 시 자동 리로드

### 개별 실행
```bash
# 백엔드만 실행
npm run server

# 프론트엔드만 실행 (다른 터미널에서)
npm start
```

### 프로덕션 모드
```bash
npm run start:prod
```
- React 앱을 빌드하고 백엔드 서버에서 서빙

## 📁 메모 파일 저장 위치

메모는 다음 위치에 `task-memo.json` 파일로 저장됩니다:

### 프로젝트별 메모
- `public/projects/{프로젝트폴더명}/task-memo.json`
- 예: `public/projects/cpue_prediction_dataset/task-memo.json`

### 직접 입력 모드 메모
- `public/projects/direct_input/task-memo.json`

## 🔧 API 엔드포인트

### 메모 저장
- **POST** `/api/save-memo`
- **Body**: `{ "project": "프로젝트명", "memos": { ... } }`

### 메모 로드
- **GET** `/api/load-memo/{프로젝트명}`

### 프로젝트 디렉토리 생성
- **POST** `/api/create-project-dir`
- **Body**: `{ "project": "프로젝트명" }`

## 💾 메모 저장 방식

1. 사용자가 메모를 작성
2. "저장" 버튼 클릭
3. API를 통해 서버에 전송
4. 서버가 `task-memo.json` 파일에 저장
5. 성공 시 콘솔에 저장 경로 출력

## 🔄 메모 로드 방식

1. 프로젝트 선택 시 자동으로 해당 메모 파일 로드
2. 파일이 없으면 빈 상태로 시작
3. 메모는 태스크별로 개별 관리

## 📝 메모 데이터 구조

```json
{
  "8": "Task 8에 대한 메모",
  "101": "Task 101에 대한 메모",
  "102": "Task 102에 대한 메모"
}
```

키 형식: `{태스크ID}` (태스크별로 개별 메모 관리)

## ⚠️ 주의사항

- 백엔드 서버가 실행되어야 메모 저장/로드 기능이 작동합니다
- 프로젝트 폴더가 존재하지 않으면 자동으로 생성됩니다
- 네트워크 오류 시 적절한 에러 메시지가 표시됩니다