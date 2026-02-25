# Wiedu 개발 가이드

## 목차
1. [로컬 개발 환경](#로컬-개발-환경)
2. [백엔드 실행](#백엔드-실행)
3. [프론트엔드 실행](#프론트엔드-실행)
4. [배포 방법](#배포-방법)
5. [데이터베이스 접근](#데이터베이스-접근)
6. [트러블슈팅](#트러블슈팅)

---

## 로컬 개발 환경

### 필수 요구사항
- Java 21
- Node.js 18+
- Docker (MySQL 컨테이너)
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`

### 프로젝트 구조
```
wiedu/
├── backend/          # Spring Boot 백엔드
│   ├── .env          # 로컬 환경변수 (Git 미포함)
│   └── .env.example  # 환경변수 템플릿
├── frontend/         # React Native (Expo)
└── docs/             # 문서
```

---

## 백엔드 실행

### 방법 1: Docker MySQL 사용 (추천)

```bash
# 1. MySQL 컨테이너 실행 확인
docker ps | grep wiedu-mysql

# 2. 환경변수 로드 & 실행
cd backend
source .env && ./gradlew bootRun
```

서버: http://localhost:8080

### 방법 2: H2 인메모리 DB (MySQL 없이)

```bash
cd backend
./gradlew bootRun --args='--spring.profiles.active=h2'
```

- H2 콘솔: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:file:./data/wiedu`
- User: `sa`, Password: (비워둠)

---

## 프론트엔드 실행

### Expo Go로 테스트 (개발 중)

```bash
# 터미널 1: 백엔드 실행
cd backend && source .env && ./gradlew bootRun

# 터미널 2: ngrok (폰에서 백엔드 접근용)
ngrok http 8080
# → ngrok URL을 frontend/src/config/api.ts에 업데이트

# 터미널 3: 프론트엔드 실행
cd frontend && npx expo start
```

폰에서 **Expo Go** 앱으로 QR 스캔 → 앱 실행

### 테스트 플로우
```
백엔드 실행 → ngrok 실행 → api.ts URL 업데이트 → expo start → Expo Go 스캔
```

---

## 배포 방법

### 백엔드 (Railway) - 자동 배포

```bash
git add .
git commit -m "feat: 기능 추가"
git push origin main
# → Railway 자동 빌드 & 배포
```

Railway 대시보드에서 배포 상태 확인:
https://railway.app

### 프론트엔드 (EAS) - 수동 빌드

```bash
cd frontend

# Preview APK (테스트용)
npx eas build --platform android --profile preview

# Production AAB (Play Store용)
npx eas build --platform android --profile production
```

빌드 완료 후 QR 코드 스캔 또는 링크로 APK 다운로드

### 배포 체크리스트

- [ ] 로컬 테스트 완료
- [ ] `frontend/src/config/api.ts`의 RAILWAY_URL 확인
- [ ] Git commit & push
- [ ] Railway 배포 성공 확인
- [ ] (프론트 변경 시) EAS 빌드 실행

---

## 데이터베이스 접근

### 로컬 MySQL (Docker)

```bash
docker exec -it wiedu-mysql mysql -u wiedu -p
# Password: rmsifk77@@
```

### Railway MySQL (프로덕션)

1. Railway 대시보드 → MySQL 서비스
2. Database 탭 → Data 탭
3. 테이블 클릭하여 데이터 조회

또는 Variables 탭에서 연결 정보 확인 후 외부 클라이언트로 접속

---

## 트러블슈팅

### 백엔드 시작 안됨

**환경변수 오류:**
```
Could not resolve placeholder 'MYSQL_PASSWORD'
```
→ `source .env` 실행 후 다시 시도

**포트 충돌:**
```
Port 8080 already in use
```
→ `lsof -i :8080` 확인 후 프로세스 종료

### API 연결 실패

1. 백엔드 실행 확인: `curl http://localhost:8080/api/studies`
2. ngrok URL 최신 확인
3. `api.ts`의 NGROK_URL 업데이트

### Docker MySQL 연결 실패

```bash
# 컨테이너 상태 확인
docker ps | grep mysql

# 컨테이너 재시작
docker restart wiedu-mysql
```

---

## 유용한 명령어

```bash
# 백엔드 빌드만
./gradlew build -x test

# 프론트엔드 캐시 초기화
npx expo start -c

# EAS 빌드 목록
npx eas build:list

# Docker MySQL 로그
docker logs wiedu-mysql

# ngrok 상태
curl http://localhost:4040/api/tunnels
```
