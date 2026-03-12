package com.wiedu.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

import java.time.LocalDateTime;

@Entity
@Table(name = "STUDY_MEMBER_REVIEWS", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"reviewer_id", "reviewee_id", "study_id"})
})
@Comment("스터디원 간 리뷰")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StudyMemberReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("리뷰 고유 ID")
    private Long id;

    @Column(nullable = false, updatable = false)
    @Comment("생성 일시")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    @Comment("리뷰 작성자 ID")
    private User reviewer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewee_id", nullable = false)
    @Comment("리뷰 대상자 ID")
    private User reviewee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_id", nullable = false)
    @Comment("스터디 ID")
    private Study study;

    @Column(nullable = false)
    @Comment("평점 (1-5)")
    private Integer rating;

    @Column(columnDefinition = "TEXT")
    @Comment("리뷰 내용")
    private String content;

    @Builder
    public StudyMemberReview(User reviewer, User reviewee, Study study, Integer rating, String content) {
        this.reviewer = reviewer;
        this.reviewee = reviewee;
        this.study = study;
        this.rating = rating;
        this.content = content;
    }
}
