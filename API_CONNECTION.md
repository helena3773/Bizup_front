# 프론트엔드-백엔드 연결 가이드

프론트엔드와 백엔드가 성공적으로 연결되었습니다! 🎉

## 연결 완료된 기능

### ✅ 재고 관리 (InventoryTab)
- 재고 목록 조회 (검색 포함)
- 재고 추가
- 재고 통계 표시
- 실시간 로딩 상태 표시

### ✅ 발주 추천 (OrderRecommendationTab)
- 발주 추천 목록 조회
- 발주 생성
- 우선순위별 분류

### ✅ 품절 관리 (OutOfStockTab)
- 품절 상품 목록 조회
- 재입고 처리

### ✅ 설정 (SettingsTab)
- 가게 정보 관리
- 직원 관리 (추가/삭제)
- 알림 설정

## 환경 변수 설정

프론트엔드 루트 디렉토리(`front/`)에 `.env` 파일을 생성하세요:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## 실행 방법

### 1. 백엔드 서버 실행

```bash
cd back
pip install -r requirements.txt
uvicorn app.main:app --reload
```

백엔드 서버가 `http://localhost:8000`에서 실행됩니다.

### 2. 프론트엔드 서버 실행

```bash
cd front
npm install
npm run dev
```

프론트엔드가 `http://localhost:5173`에서 실행됩니다.

## API 클라이언트 구조

모든 API 호출은 `front/src/lib/api.ts`에 정의되어 있습니다:

- `inventoryApi` - 재고 관리 API
- `orderApi` - 발주 관리 API
- `outOfStockApi` - 품절 관리 API
- `employeeApi` - 직원 관리 API
- `storeApi` - 가게 설정 API

## 주요 변경 사항

### 1. API 클라이언트 생성 (`front/src/lib/api.ts`)
- Fetch API 기반의 통합 API 클라이언트
- 자동 에러 처리
- TypeScript 타입 지원

### 2. 컴포넌트 업데이트
- 모든 컴포넌트에서 하드코딩된 데이터 제거
- `useEffect`를 사용한 데이터 로딩
- 로딩 상태 및 에러 처리 추가
- Toast 알림 추가 (성공/실패 메시지)

### 3. 상태 관리
- API 호출 중 로딩 상태 표시
- 에러 발생 시 사용자 친화적 메시지 표시
- 실시간 데이터 새로고침

## 문제 해결

### CORS 에러 발생 시
백엔드 `back/app/config.py`에서 CORS 설정을 확인하세요:
```python
CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]
```

### API 연결 실패 시
1. 백엔드 서버가 실행 중인지 확인
2. `.env` 파일의 `VITE_API_BASE_URL` 확인
3. 브라우저 콘솔에서 에러 메시지 확인

### 데이터가 표시되지 않을 때
1. 백엔드 데이터베이스에 데이터가 있는지 확인
2. 네트워크 탭에서 API 응답 확인
3. API 문서 (`http://localhost:8000/docs`)에서 엔드포인트 테스트

## 다음 단계

1. **인증 시스템 추가** (선택)
   - JWT 토큰 기반 인증
   - 로그인/회원가입 기능

2. **실시간 업데이트** (선택)
   - WebSocket 연결
   - 실시간 재고 알림

3. **고급 기능** (선택)
   - 재고 수정 다이얼로그
   - 발주 내역 조회
   - 통계 차트

