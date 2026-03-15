package com.wiedu.controller.attendance;

import com.wiedu.dto.attendance.*;
import com.wiedu.security.SecurityUtils;
import com.wiedu.service.attendance.SessionAttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * 회차 참석 관리 API
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SessionAttendanceController {

    private final SessionAttendanceService attendanceService;

    /**
     * 회차 참석 현황 조회
     */
    @GetMapping("/sessions/{sessionId}/attendances")
    public ResponseEntity<AttendanceSummaryResponse> getAttendanceSummary(
        @PathVariable Long sessionId
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(
            attendanceService.getAttendanceSummary(sessionId, userId)
        );
    }

    /**
     * 내 참석 응답 조회
     */
    @GetMapping("/sessions/{sessionId}/attendances/me")
    public ResponseEntity<AttendanceResponse> getMyAttendance(
        @PathVariable Long sessionId
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        AttendanceResponse response = attendanceService.getMyAttendance(sessionId, userId);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    /**
     * 참석/불참 응답
     */
    @PostMapping("/sessions/{sessionId}/attendances")
    public ResponseEntity<AttendanceResponse> respond(
        @PathVariable Long sessionId,
        @Valid @RequestBody AttendanceRequest request
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(
            attendanceService.respond(sessionId, userId, request)
        );
    }

    /**
     * 불참 승인/거절 (스터디장)
     */
    @PatchMapping("/attendances/{attendanceId}/process")
    public ResponseEntity<AttendanceResponse> processAbsence(
        @PathVariable Long attendanceId,
        @Valid @RequestBody AttendanceApprovalRequest request
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(
            attendanceService.processAbsence(attendanceId, userId, request)
        );
    }

    /**
     * 승인 대기 불참 목록 (스터디장)
     */
    @GetMapping("/studies/{studyId}/attendances/pending")
    public ResponseEntity<List<AttendanceResponse>> getPendingAbsences(
        @PathVariable Long studyId
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(
            attendanceService.getPendingAbsences(studyId, userId)
        );
    }

    /**
     * 특정 날짜의 참석 현황 (캘린더)
     */
    @GetMapping("/studies/{studyId}/attendances/by-date")
    public ResponseEntity<List<AttendanceSummaryResponse>> getAttendancesByDate(
        @PathVariable Long studyId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(
            attendanceService.getAttendancesByDate(studyId, date, userId)
        );
    }

    /**
     * 월별 회차 날짜 목록 (캘린더)
     */
    @GetMapping("/studies/{studyId}/sessions/dates")
    public ResponseEntity<List<LocalDate>> getSessionDatesInMonth(
        @PathVariable Long studyId,
        @RequestParam int year,
        @RequestParam int month
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(
            attendanceService.getSessionDatesInMonth(studyId, year, month, userId)
        );
    }

    /**
     * 회차 취소 (스터디장)
     */
    @PostMapping("/sessions/{sessionId}/cancel")
    public ResponseEntity<Void> cancelSession(
        @PathVariable Long sessionId,
        @Valid @RequestBody SessionCancellationRequest request
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        attendanceService.cancelSession(sessionId, userId, request.reason());
        return ResponseEntity.ok().build();
    }
}
