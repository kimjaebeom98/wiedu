package com.wiedu.domain.entity;

import com.wiedu.domain.enums.MemberRole;
import com.wiedu.domain.enums.MemberStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

import java.time.LocalDateTime;

@Entity
@Table(name = "STUDY_MEMBERS", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"study_id", "user_id"})
})
@Comment("스터디 멤버 정보")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StudyMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("스터디 멤버 고유 ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_id", nullable = false)
    @Comment("스터디 ID")
    private Study study;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @Comment("사용자 ID")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Comment("역할: LEADER, MEMBER")
    private MemberRole role = MemberRole.MEMBER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Comment("상태: ACTIVE, WITHDRAWN")
    private MemberStatus status = MemberStatus.ACTIVE;

    @Column(nullable = false, updatable = false)
    @Comment("가입일시")
    private LocalDateTime joinedAt;

    @Comment("탈퇴일시")
    private LocalDateTime withdrawnAt;

    @Comment("수정일시")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.joinedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Builder
    public StudyMember(Study study, User user, MemberRole role) {
        this.study = study;
        this.user = user;
        this.role = role != null ? role : MemberRole.MEMBER;
    }

    // 비즈니스 메서드
    public void withdraw() {
        this.status = MemberStatus.WITHDRAWN;
        this.withdrawnAt = LocalDateTime.now();
    }

    public void promoteToLeader() {
        this.role = MemberRole.LEADER;
    }

    public void demoteToMember() {
        this.role = MemberRole.MEMBER;
    }

    public boolean isLeader() {
        return this.role == MemberRole.LEADER;
    }

    public boolean isActive() {
        return this.status == MemberStatus.ACTIVE;
    }
}
