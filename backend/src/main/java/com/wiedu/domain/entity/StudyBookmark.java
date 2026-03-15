package com.wiedu.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

import java.time.LocalDateTime;

@Entity
@Table(name = "STUDY_BOOKMARKS", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "study_id"})
})
@Comment("스터디 찜하기")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StudyBookmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("북마크 ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @Comment("사용자 ID")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_id", nullable = false)
    @Comment("스터디 ID")
    private Study study;

    @Column(nullable = false, updatable = false)
    @Comment("생성 일시")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Builder
    public StudyBookmark(User user, Study study) {
        this.user = user;
        this.study = study;
    }

    public static StudyBookmark create(User user, Study study) {
        return StudyBookmark.builder()
                .user(user)
                .study(study)
                .build();
    }
}
