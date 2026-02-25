# Wiedu 개발 가이드

## 목차
1. [로컬 개발 환경 설정](#로컬-개발-환경-설정)
2. [백엔드 실행 방법](#백엔드-실행-방법)
3. [프론트엔드 실행 방법](#프론트엔드-실행-방법)
4. [Railway DB 접근 방법](#railway-db-접근-방법)
5. [APK 빌드 및 설치](#apk-빌드-및-설치)
6. [트러블슈팅](#트러블슈팅)

---

## 로컬 개발 환경 설정

### 필수 요구사항
- Java 21
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- (선택) MySQL 8.0+ 또는 H2 사용

### 환경변수 설정 (MySQL 사용 시)

```bash
cd backend
cp .env.example .env
```

`.env` 파일 수정:
```env
MYSQL_DATABASE=wiedu
MYSQL_USER=your_user
MYSQL_PASSWORD=your_password
JWT_SECRET=your-secret-key-must-be-at-least-32-characters-long
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_REDIRECT_URI=http://localhost:8080/api/auth/kakao/callback
FILE_BASE_URL=http://localhost:8080
```

---

## 백엔드 실행 방법

### 방법 1: H2 인메모리 DB (추천 - 가장 쉬움)

MySQL 설치 없이 바로 테스트 가능:

```bash
cd backend
./gradlew bootRun --args='--spring.profiles.active=h2'
```

- 서버: http://localhost:8080
- H2 콘솔: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:wiedu`
  - User: `sa`
  - Password: (비워둠)

> **주의:** H2는 서버 재시작 시 데이터가 초기화됩니다.

### 방법 2: 로컬 MySQL 사용

```bash
cd backend

# 환경변수 로드 후 실행
source .env && ./gradlew bootRun

# 또는 IntelliJ에서 Run Configuration에 환경변수 설정
```

### 방법 3: ngrok으로 외부 접근 허용

모바일에서 로컬 서버 테스트 시:

```bash
# 터미널 1: 백엔드 실행
./gradlew bootRun --args='--spring.profiles.active=h2'

# 터미널 2: ngrok 실행
ngrok http 8080
```

ngrok URL을 `frontend/src/config/api.ts`의 `NGROK_URL`에 업데이트:
```typescript
const NGROK_URL = 'https://xxxx-xxx-xxx.ngrok-free.app';
```

---

## 프론트엔드 실행 방법

### Expo Go 앱으로 테스트 (개발 중)

```bash
cd frontend
npm install
npx expo start
```

- 같은 네트워크의 폰에서 Expo Go 앱으로 QR 스캔
- 백엔드가 ngrok으로 노출되어 있어야 함

### APK 빌드 (실제 배포용)

```bash
cd frontend

# Preview APK 빌드 (테스트용)
npx eas build --platform android --profile preview

# Production AAB 빌드 (Play Store용)
npx eas build --platform android --profile production
```

---

## Railway DB 접근 방법

### 방법 1: Railway 대시보드 (추천)

1. [Railway 대시보드](https://railway.app) 접속
2. 프로젝트 → MySQL 서비스 클릭
3. **Database** 탭 → **Data** 탭
4. 테이블 클릭 → 데이터 조회/편집

### 방법 2: 외부 클라이언트 (DBeaver, MySQL Workbench)

1. Railway → MySQL → **Variables** 탭
2. 연결 정보 확인:
   - `MYSQL_HOST`
   - `MYSQL_PORT`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`

3. 클라이언트에서 연결

### 방법 3: CLI

```bash
mysql -h <MYSQL_HOST> -P <MYSQL_PORT> -u <MYSQL_USER> -p<MYSQL_PASSWORD> <MYSQL_DATABASE>
```

---

## APK 빌드 및 설치

### APK 다운로드

빌드 완료 후:
1. EAS에서 제공하는 QR 코드를 폰으로 스캔
2. 또는 링크 클릭하여 APK 다운로드
3. 폰에서 APK 설치 (출처를 알 수 없는 앱 허용 필요)

### 에뮬레이터 설치 오류

```
adb executable doesn't seem to work
spawn adb ENOENT
```

이 오류는 Android Studio가 설치되지 않아서 발생합니다.
**해결:** 실제 폰으로 QR 코드 스캔하여 설치하면 됩니다.

---

## 트러블슈팅

### 백엔드가 시작되지 않음

**환경변수 누락 오류:**
```
Could not resolve placeholder 'MYSQL_PASSWORD'
```
→ H2 프로필 사용: `--args='--spring.profiles.active=h2'`

### API 연결 실패

1. 백엔드 실행 확인: http://localhost:8080/api/studies
2. ngrok URL이 최신인지 확인
3. 프론트엔드 `api.ts`의 URL 확인

### Railway 배포 실패

1. Railway 대시보드 → Logs 확인
2. 환경변수 설정 확인 (Variables 탭)
3. 필수 환경변수:
   - `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
   - `JWT_SECRET`
   - `FILE_BASE_URL`

---

## 유용한 명령어

```bash
# 백엔드 빌드만
cd backend && ./gradlew build -x test

# 테스트 실행
cd backend && ./gradlew test

# 프론트엔드 캐시 초기화
cd frontend && npx expo start -c

# EAS 빌드 상태 확인
npx eas build:list
```
