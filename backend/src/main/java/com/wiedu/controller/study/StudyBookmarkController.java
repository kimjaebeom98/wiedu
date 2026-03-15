package com.wiedu.controller.study;

import com.wiedu.dto.study.StudyResponse;
import com.wiedu.security.SecurityUtils;
import com.wiedu.service.study.StudyBookmarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 스터디 북마크(찜하기) API 컨트롤러
 */
@RestController
@RequiredArgsConstructor
public class StudyBookmarkController {

    private final StudyBookmarkService bookmarkService;

    /**
     * 스터디 북마크 추가
     * POST /api/studies/{studyId}/bookmark
     */
    @PostMapping("/api/studies/{studyId}/bookmark")
    public ResponseEntity<Void> addBookmark(@PathVariable Long studyId) {
        Long userId = SecurityUtils.getCurrentUserId();
        bookmarkService.addBookmark(studyId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 스터디 북마크 삭제
     * DELETE /api/studies/{studyId}/bookmark
     */
    @DeleteMapping("/api/studies/{studyId}/bookmark")
    public ResponseEntity<Void> removeBookmark(@PathVariable Long studyId) {
        Long userId = SecurityUtils.getCurrentUserId();
        bookmarkService.removeBookmark(studyId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 스터디 북마크 토글 (추가/삭제)
     * POST /api/studies/{studyId}/bookmark/toggle
     */
    @PostMapping("/api/studies/{studyId}/bookmark/toggle")
    public ResponseEntity<Boolean> toggleBookmark(@PathVariable Long studyId) {
        Long userId = SecurityUtils.getCurrentUserId();
        boolean isBookmarked = bookmarkService.toggleBookmark(studyId, userId);
        return ResponseEntity.ok(isBookmarked);
    }

    /**
     * 북마크 여부 확인
     * GET /api/studies/{studyId}/bookmark
     */
    @GetMapping("/api/studies/{studyId}/bookmark")
    public ResponseEntity<Boolean> isBookmarked(@PathVariable Long studyId) {
        Long userId = SecurityUtils.getCurrentUserId();
        boolean isBookmarked = bookmarkService.isBookmarked(studyId, userId);
        return ResponseEntity.ok(isBookmarked);
    }

    /**
     * 내 북마크 목록 조회
     * GET /api/users/me/bookmarks
     */
    @GetMapping("/api/users/me/bookmarks")
    public ResponseEntity<Page<StudyResponse>> getMyBookmarks(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Long userId = SecurityUtils.getCurrentUserId();
        Page<StudyResponse> bookmarks = bookmarkService.getMyBookmarks(userId, pageable);
        return ResponseEntity.ok(bookmarks);
    }
}
