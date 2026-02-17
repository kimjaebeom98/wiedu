package com.wiedu.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

@Entity
@Table(name = "STUDY_CURRICULUMS")
@Comment("스터디 커리큘럼")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StudyCurriculum {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_id", nullable = false)
    private Study study;

    @Column(nullable = false)
    @Comment("주차 번호")
    private Integer weekNumber;

    @Column(nullable = false, length = 100)
    @Comment("주차 제목")
    private String title;

    @Column(columnDefinition = "TEXT")
    @Comment("주차 내용")
    private String content;

    @Builder
    public StudyCurriculum(Study study, Integer weekNumber, String title, String content) {
        this.study = study;
        this.weekNumber = weekNumber;
        this.title = title;
        this.content = content;
    }

    public static StudyCurriculum create(Study study, int weekNumber, String title, String content) {
        return StudyCurriculum.builder()
                .study(study)
                .weekNumber(weekNumber)
                .title(title)
                .content(content)
                .build();
    }
}
