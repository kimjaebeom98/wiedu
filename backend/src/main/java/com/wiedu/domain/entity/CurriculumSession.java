package com.wiedu.domain.entity;

import com.wiedu.domain.enums.SessionMode;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "CURRICULUM_SESSIONS")
@Comment("커리큘럼 회차")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CurriculumSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("회차 ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "curriculum_id", nullable = false)
    @Comment("커리큘럼 ID")
    private StudyCurriculum curriculum;

    @Column(nullable = false)
    @Comment("회차 번호")
    private Integer sessionNumber;

    @Column(nullable = false, length = 100)
    @Comment("회차 제목")
    private String title;

    @Column(columnDefinition = "TEXT")
    @Comment("회차 내용")
    private String content;

    @Column
    @Comment("진행 날짜")
    private LocalDate sessionDate;

    @Column
    @Comment("진행 시간")
    private LocalTime sessionTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Comment("진행 방식: ONLINE, OFFLINE")
    private SessionMode sessionMode = SessionMode.ONLINE;

    @Column(length = 500)
    @Comment("화상회의 링크 (온라인)")
    private String meetingLink;

    @Column(length = 200)
    @Comment("장소 (오프라인)")
    private String meetingLocation;

    @Column(nullable = false, updatable = false)
    @Comment("생성 일시")
    private LocalDateTime createdAt;

    @Column(nullable = false)
    @Comment("수정 일시")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Builder
    public CurriculumSession(StudyCurriculum curriculum, Integer sessionNumber, String title,
                             String content, LocalDate sessionDate, LocalTime sessionTime,
                             SessionMode sessionMode, String meetingLink, String meetingLocation) {
        this.curriculum = curriculum;
        this.sessionNumber = sessionNumber;
        this.title = title;
        this.content = content;
        this.sessionDate = sessionDate;
        this.sessionTime = sessionTime;
        this.sessionMode = sessionMode != null ? sessionMode : SessionMode.ONLINE;
        this.meetingLink = meetingLink;
        this.meetingLocation = meetingLocation;
    }

    public void update(String title, String content, LocalDate sessionDate, LocalTime sessionTime,
                       SessionMode sessionMode, String meetingLink, String meetingLocation) {
        this.title = title;
        this.content = content;
        this.sessionDate = sessionDate;
        this.sessionTime = sessionTime;
        this.sessionMode = sessionMode;
        this.meetingLink = meetingLink;
        this.meetingLocation = meetingLocation;
    }

    public void updateSessionNumber(Integer sessionNumber) {
        this.sessionNumber = sessionNumber;
    }
}
