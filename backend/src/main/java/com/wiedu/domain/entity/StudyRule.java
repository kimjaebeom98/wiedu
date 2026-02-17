package com.wiedu.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

@Entity
@Table(name = "STUDY_RULES")
@Comment("스터디 규칙")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StudyRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_id", nullable = false)
    private Study study;

    @Column(nullable = false)
    @Comment("규칙 순서")
    private Integer ruleOrder;

    @Column(nullable = false, length = 200)
    @Comment("규칙 내용")
    private String content;

    @Builder
    public StudyRule(Study study, Integer ruleOrder, String content) {
        this.study = study;
        this.ruleOrder = ruleOrder;
        this.content = content;
    }

    public static StudyRule create(Study study, int ruleOrder, String content) {
        return StudyRule.builder()
                .study(study)
                .ruleOrder(ruleOrder)
                .content(content)
                .build();
    }
}
