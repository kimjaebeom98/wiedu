# wiedu 개인 스터디 기능 PRD

> **버전**: 1.0
> **작성일**: 2026-03-08
> **상태**: 기획 단계

---

## 1. 개요

### 1.1 배경
현재 wiedu는 그룹 스터디 중심의 플랫폼입니다. 개인 학습 기능을 추가하여 사용자가 혼자 공부할 때도 앱을 활용하고, 그룹 스터디와 자연스럽게 연계할 수 있도록 합니다.

### 1.2 목표
- 개인 공부 시간 기록 및 시각화
- 학습 습관 형성 지원 (스트릭, 목표)
- 그룹 스터디와 개인 학습의 연계
- 소셜 학습 커뮤니티 구축

---

## 2. 핵심 기능

### 2.1 공부 시간 기록 (Phase 1)

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 스톱워치 | 시작/일시정지/정지, 경과시간 표시 | P0 |
| 포모도로 타이머 | 25분 집중 + 5분 휴식 사이클 | P1 |
| 카테고리 태깅 | 어떤 과목/스터디 공부인지 기록 | P0 |
| 백그라운드 추적 | 앱 최소화해도 계속 측정 | P1 |
| 목표 시간 설정 | 일일/주간 목표 달성률 표시 | P1 |

**UI 목업:**
```
┌─────────────────────────────┐
│      오늘의 공부 시간        │
│         02:34:15            │
│    ━━━━━━━━━━░░░ 목표 4시간   │
│                             │
│   [⏸ 일시정지]  [■ 종료]    │
│                             │
│   📚 React 공부 (1h 20m)    │
│   📝 알고리즘 (1h 14m)      │
└─────────────────────────────┘
```

**API 엔드포인트:**
```
POST   /api/study-sessions/start      # 세션 시작
PUT    /api/study-sessions/{id}/pause # 일시정지
PUT    /api/study-sessions/{id}/stop  # 종료
GET    /api/study-sessions/today      # 오늘 세션 목록
GET    /api/study-sessions/stats      # 통계 (일간/주간/월간)
```

---

### 2.2 개인 캘린더 (Phase 2)

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 월간/주간/일간 뷰 | 다양한 시점에서 확인 | P0 |
| 공부 히트맵 | GitHub 잔디처럼 시각화 | P0 |
| 그룹 스터디 연동 | 내가 참여한 그룹 일정 자동 표시 | P1 |
| 스트릭 추적 | 연속 공부일수 표시 | P1 |

**UI 목업:**
```
┌─────────── 2026년 3월 ───────────┐
│ 일  월  화  수  목  금  토        │
│                 1   2   3   4    │
│              ██  █  ███ ██       │
│  5   6   7   8   9  10  11       │
│ ██  █  ███ ██  █  ███  ░        │
│                                  │
│ ██ 3시간+  █ 1-2시간  ░ 1시간-   │
│                                  │
│ 🔥 현재 스트릭: 15일             │
└──────────────────────────────────┘
```

**API 엔드포인트:**
```
GET /api/calendar/monthly?year=2026&month=3   # 월간 데이터
GET /api/calendar/heatmap?year=2026           # 연간 히트맵
GET /api/calendar/streak                       # 스트릭 정보
```

---

### 2.3 학습 카드 & 할 일 (Phase 3)

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 플래시카드 | 앞면/뒷면 암기 카드 | P0 |
| 반복 학습 알고리즘 | SM-2 기반 복습 주기 자동 설정 | P1 |
| 투두 리스트 | 오늘 할 공부 목록 | P0 |
| 완료 시 자동 기록 | 투두 완료 → 공부 시간에 반영 | P2 |

**UI 목업:**
```
┌─────────── 오늘의 학습 ───────────┐
│ □ React Hooks 정리 (예상 1시간)  │
│ ☑ 알고리즘 문제 3개 (완료 45분)  │
│ □ 영어 단어 50개 복습            │
│                                  │
│ 📇 복습할 카드: 23장             │
│    [지금 복습하기]               │
└──────────────────────────────────┘
```

**SM-2 알고리즘 (간략):**
- 카드 복습 시 난이도 평가 (1-5)
- 다음 복습 간격 계산: `interval * easeFactor`
- 어려운 카드는 자주, 쉬운 카드는 덜 자주 복습

**API 엔드포인트:**
```
# 플래시카드
POST   /api/cards                    # 카드 생성
GET    /api/cards/due                # 오늘 복습할 카드
PUT    /api/cards/{id}/review        # 복습 결과 기록

# 투두
POST   /api/todos                    # 할 일 생성
GET    /api/todos/today              # 오늘 할 일
PUT    /api/todos/{id}/complete      # 완료 처리
```

---

### 2.4 공부 내용 공유 (Phase 4)

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 오늘의 학습 기록 | 공부한 내용 요약 포스팅 | P0 |
| 학습 카드 공유 | 내 플래시카드 세트 공개 | P1 |
| 타임라인 피드 | 팔로우한 사람들의 학습 현황 | P0 |
| 좋아요/댓글 | 상호작용 | P1 |

**UI 목업:**
```
┌─────────────────────────────────┐
│ 🧑‍💻 김재범님이 공부했습니다      │
│ React Query + Zustand 상태관리  │
│ ⏱ 2시간 30분 | 📚 프론트엔드    │
│                                 │
│ "오늘 드디어 캐싱 개념 이해함!"  │
│ 📇 정리한 카드 12장             │
│                                 │
│ ❤️ 5  💬 2  🔖 저장             │
└─────────────────────────────────┘
```

**API 엔드포인트:**
```
POST   /api/feed/posts              # 학습 기록 포스팅
GET    /api/feed/timeline           # 타임라인
POST   /api/feed/posts/{id}/like    # 좋아요
POST   /api/feed/posts/{id}/comment # 댓글
```

---

### 2.5 게이미피케이션 (Phase 5)

| 요소 | 설명 | 우선순위 |
|------|------|----------|
| 레벨 시스템 | 공부 시간에 따른 XP 획득 | P1 |
| 업적 배지 | "100시간 달성", "30일 연속" 등 | P1 |
| 주간 랭킹 | 친구/그룹 내 공부량 순위 (선택적) | P2 |
| 도전 과제 | "이번 주 20시간 채우기" | P2 |

**XP 규칙:**
| 활동 | XP |
|------|-----|
| 공부 10분당 | +10 XP |
| 일일 목표 달성 | +50 XP |
| 7일 연속 스트릭 | +100 XP |
| 카드 10장 복습 | +20 XP |

**레벨 테이블:**
| 레벨 | 필요 XP | 칭호 |
|------|---------|------|
| 1-5 | 0-500 | 새싹 |
| 6-10 | 500-2000 | 성장 중 |
| 11-20 | 2000-10000 | 꾸준함 |
| 21+ | 10000+ | 마스터 |

---

### 2.6 그룹-개인 연계 (Phase 6)

| 시나리오 | 기능 |
|----------|------|
| 그룹 스터디 예습 | 개인 공부 → 그룹 스터디에 기여도로 표시 |
| 공동 목표 | 그룹 전체 1000시간 달성 챌린지 |
| 스터디 과제 | 리더가 투두 할당 → 멤버 개인 캘린더에 표시 |
| 출석 자동화 | 스터디 시간에 공부 기록 있으면 자동 출석 |

---

## 3. 데이터 모델

### 3.1 StudySession (공부 세션)

```java
@Entity
public class StudySession {
    @Id @GeneratedValue
    private Long id;

    @ManyToOne
    private User user;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer durationMinutes;

    @ManyToOne
    private Category category;  // 선택

    @ManyToOne
    private Study study;        // 그룹 스터디 연결 (선택)

    private String memo;
    private Boolean isPublic;

    @Enumerated(EnumType.STRING)
    private SessionStatus status;  // ACTIVE, PAUSED, COMPLETED
}
```

### 3.2 LearningCard (학습 카드)

```java
@Entity
public class LearningCard {
    @Id @GeneratedValue
    private Long id;

    @ManyToOne
    private User user;

    @ManyToOne
    private CardDeck deck;      // 카드 세트

    private String front;       // 앞면
    private String back;        // 뒷면

    // SM-2 알고리즘 필드
    private LocalDate nextReviewDate;
    private Double easeFactor;  // 기본 2.5
    private Integer repetitions;
    private Integer interval;   // 일 단위
}
```

### 3.3 StudyTodo (할 일)

```java
@Entity
public class StudyTodo {
    @Id @GeneratedValue
    private Long id;

    @ManyToOne
    private User user;

    private String content;
    private Integer estimatedMinutes;  // 예상 소요 시간
    private Integer actualMinutes;     // 실제 소요 시간

    private LocalDate dueDate;
    private Boolean completed;
    private LocalDateTime completedAt;

    @ManyToOne
    private Category category;

    @ManyToOne
    private Study study;  // 그룹 과제인 경우
}
```

### 3.4 StudyGoal (목표)

```java
@Entity
public class StudyGoal {
    @Id @GeneratedValue
    private Long id;

    @ManyToOne
    private User user;

    @Enumerated(EnumType.STRING)
    private GoalType type;  // DAILY, WEEKLY, MONTHLY

    private Integer targetMinutes;
    private String period;  // "2026-03-08", "2026-W10", "2026-03"
}
```

### 3.5 FeedPost (피드 포스트)

```java
@Entity
public class FeedPost {
    @Id @GeneratedValue
    private Long id;

    @ManyToOne
    private User user;

    @ManyToOne
    private StudySession session;  // 연결된 공부 세션

    private String content;
    private Integer likesCount;
    private Integer commentsCount;

    private LocalDateTime createdAt;
}
```

---

## 4. 구현 로드맵

| Phase | 기간 | 주요 기능 | 목표 |
|-------|------|----------|------|
| **Phase 1** | 2주 | 스톱워치 + 기본 기록 | 핵심 기능 빠른 출시 |
| **Phase 2** | 2주 | 개인 캘린더 + 히트맵 | 시각적 동기부여 |
| **Phase 3** | 3주 | 투두 리스트 + 플래시카드 | 학습 도구 확장 |
| **Phase 4** | 2주 | 소셜 피드 (기본) | 커뮤니티 활성화 |
| **Phase 5** | 2주 | 게이미피케이션 | 리텐션 강화 |
| **Phase 6** | 2주 | 그룹-개인 연계 | 시너지 효과 |

---

## 5. 성공 지표

| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| DAU (Daily Active Users) | +30% | 개인 스터디 기능 사용자 수 |
| 평균 세션 시간 | +50% | 앱 내 체류 시간 증가 |
| 스트릭 유지율 | 40% | 7일+ 연속 사용자 비율 |
| 기능 전환율 | 25% | 개인→그룹 스터디 가입률 |

---

## 6. 리스크 및 고려사항

| 리스크 | 대응 방안 |
|--------|----------|
| 배터리 소모 (백그라운드 타이머) | 효율적인 백그라운드 작업 구현 |
| 서버 부하 (실시간 타이머) | 로컬 저장 + 주기적 동기화 |
| 학습 카드 데이터량 | 페이지네이션 + 로컬 캐싱 |
| 피드 스팸 | 일일 포스팅 제한 + 신고 시스템 |
