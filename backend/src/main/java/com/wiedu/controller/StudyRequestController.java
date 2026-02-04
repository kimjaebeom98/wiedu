package com.wiedu.controller;

import com.wiedu.dto.request.StudyJoinRequest;
import com.wiedu.dto.request.StudyRequestRejectRequest;
import com.wiedu.dto.response.StudyRequestResponse;
import com.wiedu.security.SecurityUtils;
import com.wiedu.service.StudyRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 스터디 가입 신청 API 컨트롤러
 */
@RestController
@RequiredArgsConstructor
public class StudyRequestController {

    private final StudyRequestService studyRequestService;

    /**
     * 스터디 가입 신청
     * POST /api/studies/{studyId}/requests
     */
    @PostMapping("/api/studies/{studyId}/requests")
    public ResponseEntity<StudyRequestResponse> applyToStudy(
            @PathVariable Long studyId,
            @Valid @RequestBody StudyJoinRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        StudyRequestResponse response = studyRequestService.applyToStudy(studyId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 가입 신청 목록 조회 (리더용)
     * GET /api/studies/{studyId}/requests
     */
    @GetMapping("/api/studies/{studyId}/requests")
    public ResponseEntity<Page<StudyRequestResponse>> getPendingRequests(
            @PathVariable Long studyId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Long userId = SecurityUtils.getCurrentUserId();
        Page<StudyRequestResponse> response = studyRequestService.findPendingRequestsByStudyId(studyId, userId, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * 가입 신청 승인
     * POST /api/study-requests/{requestId}/approve
     */
    @PostMapping("/api/study-requests/{requestId}/approve")
    public ResponseEntity<Void> approveRequest(@PathVariable Long requestId) {
        Long userId = SecurityUtils.getCurrentUserId();
        studyRequestService.approveRequest(requestId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 가입 신청 거절
     * POST /api/study-requests/{requestId}/reject
     */
    @PostMapping("/api/study-requests/{requestId}/reject")
    public ResponseEntity<Void> rejectRequest(
            @PathVariable Long requestId,
            @Valid @RequestBody(required = false) StudyRequestRejectRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        String rejectReason = request != null ? request.rejectReason() : null;
        studyRequestService.rejectRequest(requestId, userId, rejectReason);
        return ResponseEntity.ok().build();
    }

    /**
     * 가입 신청 취소 (본인)
     * DELETE /api/study-requests/{requestId}
     */
    @DeleteMapping("/api/study-requests/{requestId}")
    public ResponseEntity<Void> cancelRequest(@PathVariable Long requestId) {
        Long userId = SecurityUtils.getCurrentUserId();
        studyRequestService.cancelRequest(requestId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 내 가입 신청 목록
     * GET /api/users/me/study-requests
     */
    @GetMapping("/api/users/me/study-requests")
    public ResponseEntity<List<StudyRequestResponse>> getMyRequests() {
        Long userId = SecurityUtils.getCurrentUserId();
        List<StudyRequestResponse> response = studyRequestService.findRequestsByUserId(userId);
        return ResponseEntity.ok(response);
    }
}
