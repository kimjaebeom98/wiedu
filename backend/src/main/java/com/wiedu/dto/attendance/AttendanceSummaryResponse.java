package com.wiedu.dto.attendance;

import java.util.List;

public record AttendanceSummaryResponse(
    Long sessionId,
    int totalMembers,
    int attendingCount,
    int pendingAbsenceCount,
    int approvedAbsenceCount,
    int notRespondedCount,
    List<AttendanceResponse> attendances
) {
    public static AttendanceSummaryResponse of(
        Long sessionId,
        int totalMembers,
        List<AttendanceResponse> attendances
    ) {
        int attending = 0;
        int pendingAbsence = 0;
        int approvedAbsence = 0;

        for (AttendanceResponse a : attendances) {
            switch (a.status()) {
                case ATTENDING -> attending++;
                case PENDING_ABSENCE -> pendingAbsence++;
                case APPROVED_ABSENCE -> approvedAbsence++;
                default -> {}
            }
        }

        int notResponded = totalMembers - attendances.size();

        return new AttendanceSummaryResponse(
            sessionId,
            totalMembers,
            attending,
            pendingAbsence,
            approvedAbsence,
            notResponded,
            attendances
        );
    }
}
