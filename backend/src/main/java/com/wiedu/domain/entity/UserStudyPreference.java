package com.wiedu.domain.entity;

import com.wiedu.domain.enums.StudyType;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

import java.time.LocalDateTime;

@Entity
@Table(name = "USER_STUDY_PREFERENCES", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "study_type"})
})
@Comment("사용자 스터디 방식 선호")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserStudyPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @Comment("사용자 ID")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "study_type", nullable = false, length = 20)
    @Comment("스터디 방식 유형")
    private StudyType studyType;

    @Column(nullable = false, updatable = false)
    @Comment("생성일시")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Builder
    public UserStudyPreference(User user, StudyType studyType) {
        this.user = user;
        this.studyType = studyType;
    }

    public static UserStudyPreference create(User user, StudyType studyType) {
        return UserStudyPreference.builder()
                .user(user)
                .studyType(studyType)
                .build();
    }
}
