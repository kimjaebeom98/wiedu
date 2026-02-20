package com.wiedu.domain.entity;

import com.wiedu.domain.enums.DurationType;
import com.wiedu.domain.enums.StudyMethod;
import com.wiedu.domain.enums.StudyStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Comment;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "STUDIES")
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

    // Step 1: Category (changed from enum to entity FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @Comment("카테고리 (대분류)")
    private StudyCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subcategory_id")
    @Comment("서브카테고리 (중분류)")
    private StudySubcategory subcategory;

    @Column(length = 500)
    @Comment("커버 이미지 URL")
    private String coverImageUrl;

    @OneToMany(mappedBy = "study", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 20)
    private List<StudyTag> tags = new ArrayList<>();

    // Step 2: Detail Description
    @Column(columnDefinition = "TEXT")
    @Comment("대상 수강자 설명")
    private String targetAudience;

    @Column(columnDefinition = "TEXT")
    @Comment("학습 목표")
    private String goals;

    // Step 3: Schedule & Method
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Comment("진행 방식: ONLINE, OFFLINE, HYBRID")
    private StudyMethod studyMethod;

    @Column(length = 100)
    @Comment("진행 요일 (JSON array)")
    private String daysOfWeek;

    @Column(length = 50)
    @Comment("진행 시간")
    private String time;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Comment("기간 유형: FOUR_WEEKS, EIGHT_WEEKS, TWELVE_WEEKS, LONG_TERM")
    private DurationType durationType;

    @Column(length = 200)
    @Comment("사용 플랫폼/장소")
    private String platform;

    // Step 4: Recruitment
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

    @Column
    @Comment("참가비 (원)")
    private Integer participationFee;

    @Column
    @Comment("보증금 (원)")
    private Integer deposit;

    @Column(columnDefinition = "TEXT")
    @Comment("보증금 환불 정책")
    private String depositRefundPolicy;

    @Column(columnDefinition = "TEXT")
    @Comment("참여 조건/요구사항")
    private String requirements;

    // Step 5: Curriculum & Rules
    @OneToMany(mappedBy = "study", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 20)
    private List<StudyCurriculum> curriculums = new ArrayList<>();

    @OneToMany(mappedBy = "study", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 20)
    private List<StudyRule> rules = new ArrayList<>();

    // Status & Dates
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Comment("상태: RECRUITING, IN_PROGRESS, COMPLETED, CLOSED")
    private StudyStatus status = StudyStatus.RECRUITING;

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
    public Study(String title, String description, StudyCategory category, StudySubcategory subcategory,
                 String coverImageUrl, String targetAudience, String goals,
                 StudyMethod studyMethod, String daysOfWeek, String time, DurationType durationType, String platform,
                 User leader, Integer maxMembers, Integer participationFee, Integer deposit, String depositRefundPolicy, String requirements,
                 LocalDateTime startDate, LocalDateTime endDate) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.subcategory = subcategory;
        this.coverImageUrl = coverImageUrl;
        this.targetAudience = targetAudience;
        this.goals = goals;
        this.studyMethod = studyMethod;
        this.daysOfWeek = daysOfWeek;
        this.time = time;
        this.durationType = durationType;
        this.platform = platform;
        this.leader = leader;
        this.maxMembers = maxMembers;
        this.participationFee = participationFee;
        this.deposit = deposit;
        this.depositRefundPolicy = depositRefundPolicy;
        this.requirements = requirements;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    // Helper methods for child entities
    public void addTag(StudyTag tag) {
        this.tags.add(tag);
    }

    public void addCurriculum(StudyCurriculum curriculum) {
        this.curriculums.add(curriculum);
    }

    public void addRule(StudyRule rule) {
        this.rules.add(rule);
    }

    // Business methods
    public void updateInfo(String title, String description) {
        this.title = title;
        this.description = description;
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

    public void changeLeader(User newLeader) {
        this.leader = newLeader;
    }
}
