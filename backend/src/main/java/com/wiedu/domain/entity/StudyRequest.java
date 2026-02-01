package com.wiedu.domain.entity;

import com.wiedu.domain.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

import java.time.LocalDateTime;

@Entity
@Table(name = "STUDY_REQUESTS", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"study_id", "user_id"})
})
@Comment("스터디 가입 신청 정보")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StudyRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("신청 고유 ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_id", nullable = false)
    @Comment("스터디 ID")
    private Study study;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @Comment("신청자 ID")
    private User user;

    @Column(length = 500)
    @Comment("자기소개 / 신청 메시지")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Comment("상태: PENDING, APPROVED, REJECTED")
    private RequestStatus status = RequestStatus.PENDING;

    @Column(length = 500)
    @Comment("거절 사유")
    private String rejectReason;

    @Column(nullable = false, updatable = false)
    @Comment("신청일시")
    private LocalDateTime createdAt;

    @Comment("처리일시")
    private LocalDateTime processedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Builder
    public StudyRequest(Study study, User user, String message) {
        this.study = study;
        this.user = user;
        this.message = message;
    }

    // 비즈니스 메서드
    public void approve() {
        this.status = RequestStatus.APPROVED;
        this.processedAt = LocalDateTime.now();
    }

    public void reject(String reason) {
        this.status = RequestStatus.REJECTED;
        this.rejectReason = reason;
        this.processedAt = LocalDateTime.now();
    }

    public boolean isPending() {
        return this.status == RequestStatus.PENDING;
    }

    public boolean isApproved() {
        return this.status == RequestStatus.APPROVED;
    }
}
