package com.wiedu.controller.gallery;

import com.wiedu.dto.gallery.GalleryPhotoResponse;
import com.wiedu.dto.gallery.GalleryPhotoUpdateRequest;
import com.wiedu.security.SecurityUtils;
import com.wiedu.service.gallery.GalleryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/studies/{studyId}/gallery")
@RequiredArgsConstructor
public class GalleryController {

    private final GalleryService galleryService;

    /**
     * 갤러리 사진 목록 조회
     */
    @GetMapping("/photos")
    public ResponseEntity<Page<GalleryPhotoResponse>> getPhotos(
            @PathVariable Long studyId,
            @PageableDefault(size = 20) Pageable pageable) {
        Long userId = SecurityUtils.getCurrentUserId();
        Page<GalleryPhotoResponse> photos = galleryService.getPhotos(studyId, userId, pageable);
        return ResponseEntity.ok(photos);
    }

    /**
     * 갤러리 사진 상세 조회
     */
    @GetMapping("/photos/{photoId}")
    public ResponseEntity<GalleryPhotoResponse> getPhotoDetail(
            @PathVariable Long studyId,
            @PathVariable Long photoId) {
        Long userId = SecurityUtils.getCurrentUserId();
        GalleryPhotoResponse photo = galleryService.getPhotoDetail(studyId, photoId, userId);
        return ResponseEntity.ok(photo);
    }

    /**
     * 갤러리 사진 업로드 (multipart/form-data)
     */
    @PostMapping(value = "/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<GalleryPhotoResponse> uploadPhoto(
            @PathVariable Long studyId,
            @RequestPart("file") MultipartFile file,
            @RequestParam(value = "caption", required = false) String caption) {
        Long userId = SecurityUtils.getCurrentUserId();
        GalleryPhotoResponse photo = galleryService.uploadPhoto(studyId, userId, file, caption);
        return ResponseEntity.status(HttpStatus.CREATED).body(photo);
    }

    /**
     * 갤러리 사진 캡션 수정
     */
    @PutMapping("/photos/{photoId}")
    public ResponseEntity<GalleryPhotoResponse> updatePhoto(
            @PathVariable Long studyId,
            @PathVariable Long photoId,
            @Valid @RequestBody GalleryPhotoUpdateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        GalleryPhotoResponse photo = galleryService.updatePhoto(studyId, photoId, userId, request);
        return ResponseEntity.ok(photo);
    }

    /**
     * 갤러리 사진 삭제
     */
    @DeleteMapping("/photos/{photoId}")
    public ResponseEntity<Void> deletePhoto(
            @PathVariable Long studyId,
            @PathVariable Long photoId) {
        Long userId = SecurityUtils.getCurrentUserId();
        galleryService.deletePhoto(studyId, photoId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 갤러리 사진 개수 조회
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getPhotoCount(
            @PathVariable Long studyId) {
        Long userId = SecurityUtils.getCurrentUserId();
        long count = galleryService.getPhotoCount(studyId, userId);
        return ResponseEntity.ok(Map.of("count", count));
    }
}
