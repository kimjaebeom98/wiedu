package com.wiedu.domain.enums;

/**
 * 회차 참석 상태
 */
public enum AttendanceStatus {
    /** 참석 */
    ATTENDING,
    /** 불참 신청 (승인 대기) */
    PENDING_ABSENCE,
    /** 불참 승인됨 */
    APPROVED_ABSENCE,
    /** 불참 거절됨 */
    REJECTED_ABSENCE
}
