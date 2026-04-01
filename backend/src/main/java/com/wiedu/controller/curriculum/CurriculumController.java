package com.wiedu.controller.curriculum;

import com.wiedu.dto.curriculum.*;
import com.wiedu.security.SecurityUtils;
import com.wiedu.service.curriculum.CurriculumService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 커리큘럼 및 회차 관리 API 컨트롤러
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CurriculumController {

    private final CurriculumService curriculumService;

    // ==================== 커리큘럼 (주차) API ====================

    /**
     * 스터디 커리큘럼 목록 조회
     * GET /api/studies/{studyId}/curriculums
     *
     * 공개 API - 비멤버도 조회 가능 (스터디 상세 미리보기용)
     * 세션 상세 내용은 포함되지 않음
     */
    @GetMapping("/studies/{studyId}/curriculums")
    public ResponseEntity<List<CurriculumResponse>> getCurriculums(@PathVariable Long studyId) {
        return ResponseEntity.ok(curriculumService.getCurriculums(studyId));
    }

    /**
     * 커리큘럼 상세 조회 (세션 목록 포함) - 스터디원만 가능
     * GET /api/curriculums/{curriculumId}
     */
    @GetMapping("/curriculums/{curriculumId}")
    public ResponseEntity<CurriculumResponse> getCurriculumDetail(@PathVariable Long curriculumId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(curriculumService.getCurriculumDetail(curriculumId, userId));
    }

    /**
     * 커리큘럼 추가 (스터디장만 가능)
     * POST /api/studies/{studyId}/curriculums
     */
    @PostMapping("/studies/{studyId}/curriculums")
    public ResponseEntity<CurriculumResponse> addCurriculum(@PathVariable Long studyId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(curriculumService.addCurriculum(studyId, userId));
    }

    /**
     * 커리큘럼 수정 (스터디장만 가능)
     * PUT /api/curriculums/{curriculumId}
     */
    @PutMapping("/curriculums/{curriculumId}")
    public ResponseEntity<CurriculumResponse> updateCurriculum(
            @PathVariable Long curriculumId,
            @Valid @RequestBody CurriculumUpdateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(curriculumService.updateCurriculum(curriculumId, userId, request));
    }

    /**
     * 커리큘럼 삭제 (스터디장만 가능)
     * DELETE /api/curriculums/{curriculumId}
     */
    @DeleteMapping("/curriculums/{curriculumId}")
    public ResponseEntity<Void> deleteCurriculum(@PathVariable Long curriculumId) {
        Long userId = SecurityUtils.getCurrentUserId();
        curriculumService.deleteCurriculum(curriculumId, userId);
        return ResponseEntity.noContent().build();
    }

    // ==================== 세션 (회차) API ====================

    /**
     * 세션 목록 조회 (스터디원만 가능)
     * GET /api/curriculums/{curriculumId}/sessions
     */
    @GetMapping("/curriculums/{curriculumId}/sessions")
    public ResponseEntity<List<SessionResponse>> getSessions(@PathVariable Long curriculumId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(curriculumService.getSessions(curriculumId, userId));
    }

    /**
     * 세션 상세 조회 (스터디원만 가능)
     * GET /api/sessions/{sessionId}
     */
    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<SessionResponse> getSession(@PathVariable Long sessionId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(curriculumService.getSession(sessionId, userId));
    }

    /**
     * 세션 추가 (스터디장만 가능, 주당 최대 7회차)
     * POST /api/curriculums/{curriculumId}/sessions
     */
    @PostMapping("/curriculums/{curriculumId}/sessions")
    public ResponseEntity<SessionResponse> addSession(
            @PathVariable Long curriculumId,
            @Valid @RequestBody SessionRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(curriculumService.addSession(curriculumId, userId, request));
    }

    /**
     * 세션 수정 (스터디장만 가능)
     * PUT /api/sessions/{sessionId}
     */
    @PutMapping("/sessions/{sessionId}")
    public ResponseEntity<SessionResponse> updateSession(
            @PathVariable Long sessionId,
            @Valid @RequestBody SessionRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(curriculumService.updateSession(sessionId, userId, request));
    }

    /**
     * 세션 삭제 (스터디장만 가능)
     * DELETE /api/sessions/{sessionId}
     */
    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long sessionId) {
        Long userId = SecurityUtils.getCurrentUserId();
        curriculumService.deleteSession(sessionId, userId);
        return ResponseEntity.noContent().build();
    }
}
