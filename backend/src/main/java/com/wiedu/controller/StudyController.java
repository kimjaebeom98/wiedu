package com.wiedu.controller;

import com.wiedu.domain.enums.StudyCategory;
import com.wiedu.domain.enums.StudyStatus;
import com.wiedu.dto.request.StudyCreateRequest;
import com.wiedu.dto.request.StudyUpdateRequest;
import com.wiedu.dto.response.StudyListResponse;
import com.wiedu.dto.response.StudyResponse;
import com.wiedu.service.StudyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 스터디 API 컨트롤러
 */
@RestController
@RequestMapping("/api/studies")
@RequiredArgsConstructor
public class StudyController {

    private final StudyService studyService;

    /**
     * 스터디 생성
     * POST /api/studies
     */
    @PostMapping
    public ResponseEntity<StudyResponse> createStudy(
            @RequestHeader("X-User-Id") Long userId,  // TODO: JWT 인증으로 변경
            @Valid @RequestBody StudyCreateRequest request) {
        StudyResponse response = studyService.createStudy(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 스터디 상세 조회
     * GET /api/studies/{studyId}
     */
    @GetMapping("/{studyId}")
    public ResponseEntity<StudyResponse> getStudy(@PathVariable Long studyId) {
        StudyResponse response = studyService.findById(studyId);
        return ResponseEntity.ok(response);
    }

    /**
     * 스터디 목록 조회 (페이징)
     * GET /api/studies?page=0&size=10&sort=createdAt,desc
     */
    @GetMapping
    public ResponseEntity<Page<StudyListResponse>> getStudies(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<StudyListResponse> response = studyService.findAllStudies(pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * 모집 중인 스터디 목록
     * GET /api/studies/recruiting
     */
    @GetMapping("/recruiting")
    public ResponseEntity<Page<StudyListResponse>> getRecruitingStudies(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<StudyListResponse> response = studyService.findRecruitingStudies(pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * 상태별 스터디 목록
     * GET /api/studies/status/{status}
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<StudyListResponse>> getStudiesByStatus(
            @PathVariable StudyStatus status,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<StudyListResponse> response = studyService.findByStatus(status, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * 카테고리별 스터디 목록
     * GET /api/studies/category/{category}
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<Page<StudyListResponse>> getStudiesByCategory(
            @PathVariable StudyCategory category,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<StudyListResponse> response = studyService.findByCategory(category, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * 스터디 검색
     * GET /api/studies/search?keyword=xxx
     */
    @GetMapping("/search")
    public ResponseEntity<Page<StudyListResponse>> searchStudies(
            @RequestParam String keyword,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<StudyListResponse> response = studyService.searchByKeyword(keyword, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * 스터디 수정
     * PATCH /api/studies/{studyId}
     */
    @PatchMapping("/{studyId}")
    public ResponseEntity<StudyResponse> updateStudy(
            @PathVariable Long studyId,
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody StudyUpdateRequest request) {
        StudyResponse response = studyService.updateStudy(studyId, userId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 스터디 마감
     * POST /api/studies/{studyId}/close
     */
    @PostMapping("/{studyId}/close")
    public ResponseEntity<Void> closeStudy(
            @PathVariable Long studyId,
            @RequestHeader("X-User-Id") Long userId) {
        studyService.closeStudy(studyId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 스터디 완료
     * POST /api/studies/{studyId}/complete
     */
    @PostMapping("/{studyId}/complete")
    public ResponseEntity<Void> completeStudy(
            @PathVariable Long studyId,
            @RequestHeader("X-User-Id") Long userId) {
        studyService.completeStudy(studyId, userId);
        return ResponseEntity.ok().build();
    }
}
