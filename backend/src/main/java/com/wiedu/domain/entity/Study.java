package com.wiedu.domain.entity;

import com.wiedu.domain.enums.StudyCategory;
import com.wiedu.domain.enums.StudyStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

import java.time.LocalDateTime;

@Entity
@Table(name = "studies")
@Comment("스터디 그룹 정보")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Study {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("스터디 고유 ID")
    private Long id;

    @Column(nullable = false, length = 100)
    @Comment("스터디 제목")
    private String title;

    @Column(columnDefinition = "TEXT")
    @Comment("스터디 상세 설명")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Comment("카테고리: PROGRAMMING, LANGUAGE, CERTIFICATION, INTERVIEW, HOBBY, READING, OTHER")
    private StudyCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leader_id", nullable = false)
    @Comment("스터디장 ID")
    private User leader;

    @Column(nullable = false)
    @Comment("최대 인원")
    private Integer maxMembers;

    @Column(nullable = false)
    @Comment("현재 인원")
    private Integer currentMembers = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Comment("상태: RECRUITING, IN_PROGRESS, COMPLETED, CLOSED")
    private StudyStatus status = StudyStatus.RECRUITING;

    @Column(length = 50)
    @Comment("지역 (예: 서울 강남구)")
    private String region;

    @Column(length = 200)
    @Comment("상세 장소")
    private String detailedLocation;

    @Column(nullable = false)
    @Comment("온라인 여부")
    private boolean online = false;

    @Column(length = 100)
    @Comment("진행 일정 (예: 매주 토요일 14:00)")
    private String schedule;

    @Comment("스터디 시작 예정일")
    private LocalDateTime startDate;

    @Comment("스터디 종료 예정일")
    private LocalDateTime endDate;

    @Column(nullable = false, updatable = false)
    @Comment("생성일시")
    private LocalDateTime createdAt;

    @Comment("수정일시")
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
    public Study(String title, String description, StudyCategory category, User leader,
                 Integer maxMembers, String region, String detailedLocation, boolean online,
                 String schedule, LocalDateTime startDate, LocalDateTime endDate) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.leader = leader;
        this.maxMembers = maxMembers;
        this.region = region;
        this.detailedLocation = detailedLocation;
        this.online = online;
        this.schedule = schedule;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    // 비즈니스 메서드
    public void updateInfo(String title, String description, String schedule) {
        this.title = title;
        this.description = description;
        this.schedule = schedule;
    }

    public void incrementMember() {
        this.currentMembers++;
        if (this.currentMembers >= this.maxMembers) {
            this.status = StudyStatus.IN_PROGRESS;
        }
    }

    public void decrementMember() {
        if (this.currentMembers > 1) {
            this.currentMembers--;
        }
    }

    public void close() {
        this.status = StudyStatus.CLOSED;
    }

    public void complete() {
        this.status = StudyStatus.COMPLETED;
    }

    public boolean isRecruiting() {
        return this.status == StudyStatus.RECRUITING;
    }

    public boolean isFull() {
        return this.currentMembers >= this.maxMembers;
    }
}
