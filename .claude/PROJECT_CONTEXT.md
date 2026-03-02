# Wiedu 프로젝트 컨텍스트 (Claude 전용)

> 이 파일은 Git에 포함되지 않음. Claude가 프로젝트를 빠르게 파악하기 위한 메모.

## 프로젝트 개요

- **서비스**: 스터디 그룹 매칭 앱
- **백엔드**: Spring Boot 3.x + Java 21
- **프론트엔드**: React Native (Expo)
- **DB**: MySQL 8.0

## 로컬 환경

### Docker MySQL
```
컨테이너: wiedu-mysql
포트: 3306
DB명: wiedu
User: wiedu
Password: rmsifk77@@
```

### 백엔드 실행
```bash
cd backend
source .env && ./gradlew bootRun
```

### 프론트엔드 실행
```bash
cd frontend
npx expo start
```

## 배포 환경

### Railway (백엔드)
- URL: https://wiedu-production.up.railway.app
- 자동 배포: Git push → 자동 빌드
- DB: Railway MySQL (환경변수로 연결)

### EAS (프론트엔드)
- 수동 빌드: `npx eas build --platform android --profile preview`
- APK 다운로드 후 폰에 설치

## 주요 파일 위치

### 백엔드
- 설정: `backend/src/main/resources/application.yml`
- 프로덕션 설정: `application-prod.yml`
- H2 설정: `application-h2.yml`
- 환경변수: `backend/.env` (Git 미포함)

### 프론트엔드
- API 설정: `frontend/src/config/api.ts`
- EAS 설정: `frontend/eas.json`

## 보안 수정 이력 (2024-02)

### 수정된 CRITICAL 이슈
1. ✅ 하드코딩된 비밀번호 제거 → 환경변수로 변경
2. ✅ Path Traversal 취약점 → sanitizePath() 추가
3. ✅ Refresh Token 서버 저장 → RefreshToken 엔티티 추가

### 관련 파일
- `RefreshToken.java` - 토큰 엔티티
- `RefreshTokenRepository.java` - 토큰 리포지토리
- `AuthService.java` - 토큰 저장/검증 로직
- `LocalFileStorageService.java` - 경로 검증 추가

## 자주 쓰는 명령어

```bash
# 백엔드 빌드
cd backend && ./gradlew build -x test

# H2 모드로 실행 (MySQL 없이)
./gradlew bootRun --args='--spring.profiles.active=h2'

# ngrok 실행
ngrok http 8080

# EAS 빌드
cd frontend && npx eas build --platform android --profile preview
```

## 주의사항

- `application.yml`에 기본값 넣지 말 것 (보안)
- 프론트 수정 시 EAS 빌드 필요 (자동 배포 안됨)
- Railway 무료 플랜: 월 $5 크레딧 제한
