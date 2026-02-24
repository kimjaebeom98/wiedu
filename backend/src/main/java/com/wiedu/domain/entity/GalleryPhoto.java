package com.wiedu.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

import java.time.LocalDateTime;

@Entity
@Table(name = "GALLERY_PHOTOS")
@Comment("갤러리 사진")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GalleryPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("갤러리 사진 ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_id", nullable = false)
    @Comment("스터디 ID")
    private Study study;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploader_id", nullable = false)
    @Comment("업로더 ID")
    private User uploader;

    @Column(nullable = false, length = 255)
    @Comment("원본 파일명")
    private String originalFileName;

    @Column(nullable = false, length = 500)
    @Comment("저장된 파일 URL")
    private String storedFileUrl;

    @Column(length = 500)
    @Comment("썸네일 URL")
    private String thumbnailUrl;

    @Column(length = 50)
    @Comment("MIME 타입")
    private String mimeType;

    @Column
    @Comment("파일 크기 (bytes)")
    private Long fileSize;

    @Column(length = 500)
    @Comment("사진 캡션")
    private String caption;

    @Column(nullable = false, updatable = false)
    @Comment("생성일시")
    private LocalDateTime createdAt;

    @Builder
    public GalleryPhoto(Study study, User uploader, String originalFileName,
                        String storedFileUrl, String thumbnailUrl, String mimeType,
                        Long fileSize, String caption) {
        this.study = study;
        this.uploader = uploader;
        this.originalFileName = originalFileName;
        this.storedFileUrl = storedFileUrl;
        this.thumbnailUrl = thumbnailUrl;
        this.mimeType = mimeType;
        this.fileSize = fileSize;
        this.caption = caption;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public boolean isOwnedBy(Long userId) {
        return this.uploader.getId().equals(userId);
    }

    public void updateCaption(String caption) {
        this.caption = caption;
    }
}
