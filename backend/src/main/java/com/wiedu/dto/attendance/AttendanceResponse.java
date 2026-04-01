package com.wiedu.dto.attendance;

import com.wiedu.domain.entity.SessionAttendance;
import com.wiedu.domain.enums.AttendanceStatus;

import java.time.LocalDateTime;

public record AttendanceResponse(
    Long id,
    Long sessionId,
    Long userId,
    String userNickname,
    String userProfileImage,
    AttendanceStatus status,
    String absenceReason,
    LocalDateTime respondedAt,
    Long approvedById,
    String approvedByNickname,
    LocalDateTime approvedAt,
    String approvalComment
) {
    public static AttendanceResponse from(SessionAttendance attendance) {
        return new AttendanceResponse(
            attendance.getId(),
            attendance.getSession().getId(),
            attendance.getUser() != null ? attendance.getUser().getId() : null,
            attendance.getUser() != null ? attendance.getUser().getNickname() : "탈퇴한 사용자",
            attendance.getUser() != null ? attendance.getUser().getProfileImage() : null,
            attendance.getStatus(),
            attendance.getAbsenceReason(),
            attendance.getRespondedAt(),
            attendance.getApprovedBy() != null ? attendance.getApprovedBy().getId() : null,
            attendance.getApprovedBy() != null ? attendance.getApprovedBy().getNickname() : null,
            attendance.getApprovedAt(),
            attendance.getApprovalComment()
        );
    }
}
