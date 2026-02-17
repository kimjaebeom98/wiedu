package com.wiedu.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "STUDY_CATEGORIES")
@Comment("스터디 카테고리 (대분류)")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StudyCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("카테고리 ID")
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    @Comment("카테고리 코드 (예: LANGUAGE, IT_DEV)")
    private String code;

    @Column(nullable = false, length = 50)
    @Comment("카테고리 이름 (예: 어학, IT/개발)")
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

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StudySubcategory> subcategories = new ArrayList<>();

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
    public StudyCategory(String code, String name, String icon, Integer sortOrder) {
        this.code = code;
        this.name = name;
        this.icon = icon;
        this.sortOrder = sortOrder != null ? sortOrder : 0;
    }

    public static StudyCategory create(String code, String name, String icon, int sortOrder) {
        return StudyCategory.builder()
                .code(code)
                .name(name)
                .icon(icon)
                .sortOrder(sortOrder)
                .build();
    }

    public void addSubcategory(StudySubcategory subcategory) {
        this.subcategories.add(subcategory);
    }
}
