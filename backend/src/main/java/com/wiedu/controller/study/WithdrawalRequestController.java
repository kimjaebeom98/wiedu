package com.wiedu.controller.study;

import com.wiedu.dto.study.WithdrawalRequest;
import com.wiedu.dto.study.WithdrawalRequestResponse;
import com.wiedu.security.SecurityUtils;
import com.wiedu.service.study.WithdrawalRequestService;
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
 * 스터디 탈퇴 신청 API 컨트롤러
 */
@RestController
@RequiredArgsConstructor
public class WithdrawalRequestController {

    private final WithdrawalRequestService withdrawalRequestService;

    /**
     * 스터디 탈퇴 신청
     * POST /api/studies/{studyId}/withdrawal-requests
     */
    @PostMapping("/api/studies/{studyId}/withdrawal-requests")
    public ResponseEntity<WithdrawalRequestResponse> requestWithdrawal(
            @PathVariable Long studyId,
            @Valid @RequestBody WithdrawalRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        WithdrawalRequestResponse response = withdrawalRequestService.requestWithdrawal(studyId, userId, request.reason());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 탈퇴 신청 목록 조회 (리더용)
     * GET /api/studies/{studyId}/withdrawal-requests
     */
    @GetMapping("/api/studies/{studyId}/withdrawal-requests")
    public ResponseEntity<Page<WithdrawalRequestResponse>> getPendingWithdrawalRequests(
            @PathVariable Long studyId,
            @PageableDefault(size = 50, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Long userId = SecurityUtils.getCurrentUserId();
        Page<WithdrawalRequestResponse> response = withdrawalRequestService.findPendingWithdrawalRequests(studyId, userId, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * 탈퇴 신청 수 조회 (리더용)
     * GET /api/studies/{studyId}/withdrawal-requests/count
     */
    @GetMapping("/api/studies/{studyId}/withdrawal-requests/count")
    public ResponseEntity<Long> countPendingWithdrawalRequests(@PathVariable Long studyId) {
        Long userId = SecurityUtils.getCurrentUserId();
        long count = withdrawalRequestService.countPendingWithdrawalRequests(studyId, userId);
        return ResponseEntity.ok(count);
    }

    /**
     * 탈퇴 신청 승인 (리더만)
     * POST /api/withdrawal-requests/{requestId}/approve
     */
    @PostMapping("/api/withdrawal-requests/{requestId}/approve")
    public ResponseEntity<Void> approveWithdrawal(@PathVariable Long requestId) {
        Long userId = SecurityUtils.getCurrentUserId();
        withdrawalRequestService.approveWithdrawal(requestId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 탈퇴 신청 취소 (본인)
     * DELETE /api/withdrawal-requests/{requestId}
     */
    @DeleteMapping("/api/withdrawal-requests/{requestId}")
    public ResponseEntity<Void> cancelWithdrawalRequest(@PathVariable Long requestId) {
        Long userId = SecurityUtils.getCurrentUserId();
        withdrawalRequestService.cancelWithdrawalRequest(requestId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 내 탈퇴 신청 목록
     * GET /api/users/me/withdrawal-requests
     */
    @GetMapping("/api/users/me/withdrawal-requests")
    public ResponseEntity<List<WithdrawalRequestResponse>> getMyWithdrawalRequests() {
        Long userId = SecurityUtils.getCurrentUserId();
        List<WithdrawalRequestResponse> response = withdrawalRequestService.findMyWithdrawalRequests(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 특정 스터디에 대한 내 탈퇴 신청 조회
     * GET /api/studies/{studyId}/withdrawal-requests/me
     */
    @GetMapping("/api/studies/{studyId}/withdrawal-requests/me")
    public ResponseEntity<WithdrawalRequestResponse> getMyWithdrawalRequestForStudy(@PathVariable Long studyId) {
        Long userId = SecurityUtils.getCurrentUserId();
        WithdrawalRequestResponse response = withdrawalRequestService.findMyWithdrawalRequestForStudy(studyId, userId);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }
}
