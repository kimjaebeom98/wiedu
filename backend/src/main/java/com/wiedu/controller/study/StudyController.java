package com.wiedu.controller.study;

import com.wiedu.domain.enums.StudyStatus;
import com.wiedu.dto.study.StudyCreateRequest;
import com.wiedu.dto.study.StudyUpdateRequest;
import com.wiedu.dto.study.StudyListResponse;
import com.wiedu.dto.study.StudyResponse;
import com.wiedu.security.SecurityUtils;
import com.wiedu.service.study.StudyService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
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
            @Valid @RequestBody StudyCreateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        StudyResponse response = studyService.createStudy(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 스터디 상세 조회
     * GET /api/studies/{studyId}
     * 로그인된 사용자의 경우 멤버십 정보(isMember, memberRole) 포함
     */
    @GetMapping("/{studyId}")
    public ResponseEntity<StudyResponse> getStudy(@PathVariable Long studyId) {
        Long userId = SecurityUtils.isAuthenticated() ? SecurityUtils.getCurrentUserId() : null;
        StudyResponse response = studyService.findById(studyId, userId);
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
     * 카테고리별 스터디 목록 (서브카테고리 필터 지원)
     * GET /api/studies/category/{categoryId}?subcategoryId=xxx
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<Page<StudyListResponse>> getStudiesByCategory(
            @PathVariable Long categoryId,
            @RequestParam(required = false) Long subcategoryId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<StudyListResponse> response = studyService.findByCategoryAndSubcategory(categoryId, subcategoryId, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * 스터디 검색
     * GET /api/studies/search?keyword=xxx
     */
    @GetMapping("/search")
    public ResponseEntity<Page<StudyListResponse>> searchStudies(
            @RequestParam @Size(max = 100, message = "검색어는 100자 이하로 입력해주세요") String keyword,
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
            @Valid @RequestBody StudyUpdateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        StudyResponse response = studyService.updateStudy(studyId, userId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 근처 스터디 검색
     * GET /api/studies/nearby?latitude=&longitude=&radius=
     */
    @GetMapping("/nearby")
    public ResponseEntity<java.util.List<StudyListResponse>> getNearbyStudies(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "10.0") Double radius) {
        java.util.List<StudyListResponse> response = studyService.findNearbyStudies(latitude, longitude, radius);
        return ResponseEntity.ok(response);
    }

    /**
     * 인기 스터디 목록 (충원율 높은 순)
     * GET /api/studies/popular?limit=5
     */
    @GetMapping("/popular")
    public ResponseEntity<java.util.List<StudyListResponse>> getPopularStudies(
            @RequestParam(defaultValue = "5") int limit) {
        java.util.List<StudyListResponse> response = studyService.findPopularStudies(limit);
        return ResponseEntity.ok(response);
    }

    /**
     * 인기 스터디 목록 페이지네이션 (충원율 높은 순)
     * GET /api/studies/popular/all?page=0&size=10
     */
    @GetMapping("/popular/all")
    public ResponseEntity<Page<StudyListResponse>> getPopularStudiesPaginated(
            @PageableDefault(size = 10) Pageable pageable) {
        Page<StudyListResponse> response = studyService.findPopularStudiesPaginated(pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * 근처 스터디 검색 페이지네이션
     * GET /api/studies/nearby/all?latitude=&longitude=&radius=&page=0&size=10
     */
    @GetMapping("/nearby/all")
    public ResponseEntity<Page<StudyListResponse>> getNearbyStudiesPaginated(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "10.0") Double radius,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<StudyListResponse> response = studyService.findNearbyStudiesPaginated(latitude, longitude, radius, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * 스터디 마감
     * POST /api/studies/{studyId}/close
     */
    @PostMapping("/{studyId}/close")
    public ResponseEntity<Void> closeStudy(@PathVariable Long studyId) {
        Long userId = SecurityUtils.getCurrentUserId();
        studyService.closeStudy(studyId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 스터디 완료
     * POST /api/studies/{studyId}/complete
     */
    @PostMapping("/{studyId}/complete")
    public ResponseEntity<Void> completeStudy(@PathVariable Long studyId) {
        Long userId = SecurityUtils.getCurrentUserId();
        studyService.completeStudy(studyId, userId);
        return ResponseEntity.ok().build();
    }
}
