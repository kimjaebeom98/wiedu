package com.wiedu.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

import java.time.LocalDateTime;

@Entity
@Table(name = "STUDY_SUBCATEGORIES", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"category_id", "code"})
})
@Comment("스터디 서브카테고리 (중분류)")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StudySubcategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("서브카테고리 ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @Comment("상위 카테고리 ID")
    private StudyCategory category;

    @Column(nullable = false, length = 50)
    @Comment("서브카테고리 코드 (예: TOEIC, CODING_TEST)")
    private String code;

    @Column(nullable = false, length = 50)
    @Comment("서브카테고리 이름 (예: 토익, 코딩테스트)")
    private String name;

    @Column(length = 100)
    @Comment("아이콘 이름 또는 URL")
    private String icon;

    @Column(nullable = false)
    @Comment("정렬 순서")
    private Integer sortOrder = 0;

    @Column(nullable = false)
    @Comment("활성화 여부")
    private boolean active = true;

    @Column(nullable = false, updatable = false)
    @Comment("생성일시")
    private LocalDateTime createdAt;

    @Comment("수정일시")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Builder
    public StudySubcategory(StudyCategory category, String code, String name, String icon, Integer sortOrder) {
        this.category = category;
        this.code = code;
        this.name = name;
        this.icon = icon;
        this.sortOrder = sortOrder != null ? sortOrder : 0;
    }

    public static StudySubcategory create(StudyCategory category, String code, String name, int sortOrder) {
        return StudySubcategory.builder()
                .category(category)
                .code(code)
                .name(name)
                .sortOrder(sortOrder)
                .build();
    }
}
