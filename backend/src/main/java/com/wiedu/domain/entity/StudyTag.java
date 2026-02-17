package com.wiedu.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

@Entity
@Table(name = "STUDY_TAGS", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"study_id", "tag_name"})
})
@Comment("스터디 태그")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StudyTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_id", nullable = false)
    private Study study;

    @Column(name = "tag_name", nullable = false, length = 30)
    @Comment("태그 이름")
    private String tagName;

    @Column(nullable = false)
    @Comment("정렬 순서")
    private Integer sortOrder = 0;

    @Builder
    public StudyTag(Study study, String tagName, Integer sortOrder) {
        this.study = study;
        this.tagName = tagName;
        this.sortOrder = sortOrder != null ? sortOrder : 0;
    }

    public static StudyTag create(Study study, String tagName, int sortOrder) {
        return StudyTag.builder()
                .study(study)
                .tagName(tagName)
                .sortOrder(sortOrder)
                .build();
    }
}
