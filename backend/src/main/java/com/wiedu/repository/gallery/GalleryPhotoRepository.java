package com.wiedu.repository.gallery;

import com.wiedu.domain.entity.GalleryPhoto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * 갤러리 사진 Repository
 */
public interface GalleryPhotoRepository extends JpaRepository<GalleryPhoto, Long> {

    /**
     * 스터디별 갤러리 사진 목록 조회 (최신순)
     */
    Page<GalleryPhoto> findByStudyIdOrderByCreatedAtDesc(Long studyId, Pageable pageable);

    /**
     * 특정 스터디의 특정 사진 조회
     */
    Optional<GalleryPhoto> findByIdAndStudyId(Long id, Long studyId);

    /**
     * 스터디별 갤러리 사진 개수 조회
     */
    long countByStudyId(Long studyId);

    /**
     * 업로더별 갤러리 사진 조회
     */
    Page<GalleryPhoto> findByUploaderIdOrderByCreatedAtDesc(Long uploaderId, Pageable pageable);
}
