package com.wiedu.domain.entity;

import com.wiedu.domain.enums.AttendanceStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

import java.time.LocalDateTime;

@Entity
@Table(name = "SESSION_ATTENDANCES", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"session_id", "user_id"})
})
@Comment("회차 참석 정보")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SessionAttendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("참석 ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    @Comment("회차 ID")
    private CurriculumSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @Comment("사용자 ID")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Comment("참석 상태: ATTENDING, PENDING_ABSENCE, APPROVED_ABSENCE, REJECTED_ABSENCE")
    private AttendanceStatus status;

    @Column(length = 500)
    @Comment("불참 사유")
    private String absenceReason;

    @Column(nullable = false)
    @Comment("응답 일시")
    private LocalDateTime respondedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    @Comment("승인/거절한 사용자 (스터디장)")
    private User approvedBy;

    @Column
    @Comment("승인/거절 일시")
    private LocalDateTime approvedAt;

    @Column(length = 500)
    @Comment("승인/거절 사유 (거절 시)")
    private String approvalComment;

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
        if (this.respondedAt == null) {
            this.respondedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Builder
    public SessionAttendance(CurriculumSession session, User user, AttendanceStatus status, String absenceReason) {
        this.session = session;
        this.user = user;
        this.status = status;
        this.absenceReason = absenceReason;
        this.respondedAt = LocalDateTime.now();
    }

    /**
     * 참석으로 응답
     */
    public void markAsAttending() {
        this.status = AttendanceStatus.ATTENDING;
        this.absenceReason = null;
        this.respondedAt = LocalDateTime.now();
        this.approvedBy = null;
        this.approvedAt = null;
        this.approvalComment = null;
    }

    /**
     * 불참으로 응답 (승인 대기)
     */
    public void markAsAbsent(String reason) {
        this.status = AttendanceStatus.PENDING_ABSENCE;
        this.absenceReason = reason;
        this.respondedAt = LocalDateTime.now();
        this.approvedBy = null;
        this.approvedAt = null;
        this.approvalComment = null;
    }

    /**
     * 불참 승인
     */
    public void approveAbsence(User approver) {
        this.status = AttendanceStatus.APPROVED_ABSENCE;
        this.approvedBy = approver;
        this.approvedAt = LocalDateTime.now();
        this.approvalComment = null;
    }

    /**
     * 불참 거절
     */
    public void rejectAbsence(User approver, String comment) {
        this.status = AttendanceStatus.REJECTED_ABSENCE;
        this.approvedBy = approver;
        this.approvedAt = LocalDateTime.now();
        this.approvalComment = comment;
    }
}
