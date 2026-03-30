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
public class Study extends BaseEntity {

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

    @Column(length = 50)
    @Comment("모임 장소 시/도 (예: 서울특별시)")
    private String meetingRegion;

    @Column(length = 50)
    @Comment("모임 장소 시/군/구 (예: 강남구)")
    private String meetingCity;

    @Comment("모임 장소 위도")
    private Double meetingLatitude;

    @Comment("모임 장소 경도")
    private Double meetingLongitude;

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

    // Members
    @OneToMany(mappedBy = "study")
    @BatchSize(size = 10)
    private List<StudyMember> members = new ArrayList<>();

    // Status & Dates
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Comment("상태: RECRUITING, IN_PROGRESS, COMPLETED, CLOSED")
    private StudyStatus status = StudyStatus.RECRUITING;

    @Comment("스터디 시작 예정일")
    private LocalDateTime startDate;

    @Comment("스터디 종료 예정일")
    private LocalDateTime endDate;

    @Builder
    public Study(String title, String description, StudyCategory category, StudySubcategory subcategory,
                 String coverImageUrl, String targetAudience, String goals,
                 StudyMethod studyMethod, String daysOfWeek, String time, DurationType durationType, String platform,
                 String meetingRegion, String meetingCity,
                 Double meetingLatitude, Double meetingLongitude,
                 User leader, Integer maxMembers, Integer deposit, String depositRefundPolicy, String requirements,
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
        this.meetingRegion = meetingRegion;
        this.meetingCity = meetingCity;
        this.meetingLatitude = meetingLatitude;
        this.meetingLongitude = meetingLongitude;
        this.leader = leader;
        this.maxMembers = maxMembers;
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

    public void updateFull(String title, String description, StudyCategory category, StudySubcategory subcategory,
                           String coverImageUrl, String targetAudience, String goals,
                           StudyMethod studyMethod, String daysOfWeek, String time, DurationType durationType,
                           String platform, String meetingRegion, String meetingCity,
                           Double meetingLatitude, Double meetingLongitude,
                           Integer maxMembers, Integer deposit, String depositRefundPolicy, String requirements) {
        if (title != null) this.title = title;
        if (description != null) this.description = description;
        if (category != null) this.category = category;
        this.subcategory = subcategory;
        if (coverImageUrl != null) this.coverImageUrl = coverImageUrl;
        if (targetAudience != null) this.targetAudience = targetAudience;
        if (goals != null) this.goals = goals;
        if (studyMethod != null) this.studyMethod = studyMethod;
        if (daysOfWeek != null) this.daysOfWeek = daysOfWeek;
        if (time != null) this.time = time;
        if (durationType != null) this.durationType = durationType;
        if (platform != null) this.platform = platform;
        if (meetingRegion != null) this.meetingRegion = meetingRegion;
        if (meetingCity != null) this.meetingCity = meetingCity;
        if (meetingLatitude != null) this.meetingLatitude = meetingLatitude;
        if (meetingLongitude != null) this.meetingLongitude = meetingLongitude;
        if (maxMembers != null) {
            if (maxMembers < this.currentMembers) {
                throw new IllegalArgumentException("정원은 현재 멤버 수(" + this.currentMembers + "명)보다 작게 설정할 수 없습니다.");
            }
            this.maxMembers = maxMembers;
        }
        if (deposit != null) this.deposit = deposit;
        if (depositRefundPolicy != null) this.depositRefundPolicy = depositRefundPolicy;
        if (requirements != null) this.requirements = requirements;
    }

    public void clearTags() {
        this.tags.clear();
    }

    public void clearCurriculums() {
        this.curriculums.clear();
    }

    public void clearRules() {
        this.rules.clear();
    }

    // Note: incrementMember/decrementMember 로직은 StudyRepository의 atomic 쿼리에서 처리
    // incrementMemberCount(): 멤버 증가 + 정원 도달 시 자동 상태 전이
    // decrementMemberCount(): 멤버 감소 (최소 1명 유지)

    public void close() {
        if (this.status == StudyStatus.COMPLETED || this.status == StudyStatus.CLOSED) {
            throw new IllegalStateException("이미 완료되었거나 마감된 스터디입니다.");
        }
        this.status = StudyStatus.CLOSED;
    }

    public void complete() {
        if (this.status != StudyStatus.IN_PROGRESS) {
            throw new IllegalStateException("진행 중인 스터디만 완료 처리할 수 있습니다.");
        }
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
