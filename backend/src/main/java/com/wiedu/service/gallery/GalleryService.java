package com.wiedu.service.gallery;

import com.wiedu.domain.entity.GalleryPhoto;
import com.wiedu.domain.entity.Study;
import com.wiedu.domain.entity.User;
import com.wiedu.domain.enums.MemberRole;
import com.wiedu.domain.enums.MemberStatus;
import com.wiedu.dto.gallery.GalleryPhotoResponse;
import com.wiedu.dto.gallery.GalleryPhotoUpdateRequest;
import com.wiedu.exception.BusinessException;
import com.wiedu.exception.ErrorCode;
import com.wiedu.repository.gallery.GalleryPhotoRepository;
import com.wiedu.repository.study.StudyMemberRepository;
import com.wiedu.repository.study.StudyRepository;
import com.wiedu.repository.user.UserRepository;
import com.wiedu.service.file.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GalleryService {

    private final GalleryPhotoRepository galleryPhotoRepository;
    private final StudyRepository studyRepository;
    private final StudyMemberRepository studyMemberRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    @Value("${file.max-size:10485760}")
    private long maxFileSize;

    @Value("${file.allowed-types:image/jpeg,image/png,image/webp}")
    private String allowedTypes;

    /**
     * 갤러리 사진 목록 조회
     */
    public Page<GalleryPhotoResponse> getPhotos(Long studyId, Long userId, Pageable pageable) {
        Study study = findStudyById(studyId);
        validateMembership(study, userId);

        Page<GalleryPhoto> photos = galleryPhotoRepository.findByStudyIdOrderByCreatedAtDesc(studyId, pageable);
        return photos.map(GalleryPhotoResponse::from);
    }

    /**
     * 갤러리 사진 상세 조회
     */
    public GalleryPhotoResponse getPhotoDetail(Long studyId, Long photoId, Long userId) {
        Study study = findStudyById(studyId);
        validateMembership(study, userId);

        GalleryPhoto photo = galleryPhotoRepository.findByIdAndStudyId(photoId, studyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.GALLERY_PHOTO_NOT_FOUND));

        return GalleryPhotoResponse.from(photo);
    }

    /**
     * 갤러리 사진 업로드
     */
    @Transactional
    public GalleryPhotoResponse uploadPhoto(Long studyId, Long userId, MultipartFile file, String caption) {
        Study study = findStudyById(studyId);
        User user = findUserById(userId);
        validateMembership(study, userId);

        // 파일 검증
        validateFile(file);

        try {
            // 파일 저장 (gallery 서브디렉토리에)
            String storedUrl = fileStorageService.store(file, "gallery/" + studyId);

            // 썸네일 URL 생성 (LocalFileStorageService에서 thumb_ 접두사로 같은 디렉토리에 저장)
            // 예: /uploads/gallery/1/abc.jpg -> /uploads/gallery/1/thumb_abc.jpg
            int lastSlashIndex = storedUrl.lastIndexOf('/');
            String thumbnailUrl = storedUrl.substring(0, lastSlashIndex + 1) + "thumb_" + storedUrl.substring(lastSlashIndex + 1);

            GalleryPhoto photo = GalleryPhoto.builder()
                    .study(study)
                    .uploader(user)
                    .originalFileName(file.getOriginalFilename())
                    .storedFileUrl(storedUrl)
                    .thumbnailUrl(thumbnailUrl)
                    .mimeType(file.getContentType())
                    .fileSize(file.getSize())
                    .caption(caption)
                    .build();

            GalleryPhoto savedPhoto = galleryPhotoRepository.save(photo);
            return GalleryPhotoResponse.from(savedPhoto);
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.GALLERY_UPLOAD_FAILED);
        }
    }

    /**
     * 갤러리 사진 캡션 수정
     */
    @Transactional
    public GalleryPhotoResponse updatePhoto(Long studyId, Long photoId, Long userId, GalleryPhotoUpdateRequest request) {
        Study study = findStudyById(studyId);
        validateMembership(study, userId);

        GalleryPhoto photo = galleryPhotoRepository.findByIdAndStudyId(photoId, studyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.GALLERY_PHOTO_NOT_FOUND));

        // 본인만 수정 가능
        if (!photo.isOwnedBy(userId)) {
            throw new BusinessException(ErrorCode.GALLERY_NOT_PHOTO_OWNER);
        }

        photo.updateCaption(request.caption());
        return GalleryPhotoResponse.from(photo);
    }

    /**
     * 갤러리 사진 삭제
     */
    @Transactional
    public void deletePhoto(Long studyId, Long photoId, Long userId) {
        Study study = findStudyById(studyId);
        User user = findUserById(userId);
        validateMembership(study, userId);

        GalleryPhoto photo = galleryPhotoRepository.findByIdAndStudyId(photoId, studyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.GALLERY_PHOTO_NOT_FOUND));

        // 본인 또는 스터디 리더만 삭제 가능
        boolean isOwner = photo.isOwnedBy(userId);
        boolean isLeader = studyMemberRepository.findByStudyAndUser(study, user)
                .map(m -> m.getRole() == MemberRole.LEADER)
                .orElse(false);

        if (!isOwner && !isLeader) {
            throw new BusinessException(ErrorCode.GALLERY_NOT_PHOTO_OWNER);
        }

        // 파일 삭제
        fileStorageService.delete(photo.getStoredFileUrl());
        if (photo.getThumbnailUrl() != null) {
            fileStorageService.delete(photo.getThumbnailUrl());
        }

        galleryPhotoRepository.delete(photo);
    }

    /**
     * 갤러리 사진 개수 조회
     */
    public long getPhotoCount(Long studyId, Long userId) {
        Study study = findStudyById(studyId);
        validateMembership(study, userId);
        return galleryPhotoRepository.countByStudyId(studyId);
    }

    // === Helper Methods ===

    private Study findStudyById(Long studyId) {
        return studyRepository.findById(studyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));
    }

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    private void validateMembership(Study study, Long userId) {
        User user = findUserById(userId);
        boolean isMember = studyMemberRepository.existsByStudyAndUserAndStatus(study, user, MemberStatus.ACTIVE);
        if (!isMember) {
            throw new BusinessException(ErrorCode.NOT_STUDY_MEMBER);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.GALLERY_FILE_EMPTY);
        }

        if (file.getSize() > maxFileSize) {
            throw new BusinessException(ErrorCode.GALLERY_FILE_TOO_LARGE);
        }

        String contentType = file.getContentType();
        List<String> allowedTypeList = Arrays.asList(allowedTypes.split(","));
        if (contentType == null || !allowedTypeList.contains(contentType)) {
            throw new BusinessException(ErrorCode.GALLERY_INVALID_FILE_TYPE);
        }
    }
}
