package com.wiedu.dto.gallery;

import com.wiedu.domain.entity.GalleryPhoto;
import java.time.LocalDateTime;

public record GalleryPhotoResponse(
    Long id,
    Long studyId,
    Long uploaderId,
    String uploaderNickname,
    String uploaderProfileImage,
    String originalFileName,
    String storedFileUrl,
    String thumbnailUrl,
    String mimeType,
    Long fileSize,
    String caption,
    LocalDateTime createdAt
) {
    public static GalleryPhotoResponse from(GalleryPhoto photo) {
        return new GalleryPhotoResponse(
            photo.getId(),
            photo.getStudy().getId(),
            photo.getUploader().getId(),
            photo.getUploader().getNickname(),
            photo.getUploader().getProfileImage(),
            photo.getOriginalFileName(),
            photo.getStoredFileUrl(),
            photo.getThumbnailUrl(),
            photo.getMimeType(),
            photo.getFileSize(),
            photo.getCaption(),
            photo.getCreatedAt()
        );
    }
}
