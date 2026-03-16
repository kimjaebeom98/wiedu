package com.wiedu.domain.enums;

/**
 * 알림 유형
 */
public enum NotificationType {
    // 스터디 관련
    STUDY_APPROVED,      // 스터디 가입 승인됨
    STUDY_REJECTED,      // 스터디 가입 거절됨
    STUDY_COMPLETED,     // 스터디 종료됨
    NEW_APPLICANT,       // 새 지원자 (리더에게)

    // 리뷰 관련
    REVIEW_REQUEST,      // 리뷰 작성 요청
    NEW_REVIEW,          // 새 리뷰가 등록됨

    // 커리큘럼/회차 관련
    SESSION_CREATED,     // 새 회차 등록됨
    SESSION_CANCELLED,   // 회차 취소됨

    // 참석 관련
    ABSENCE_REQUEST,     // 불참 신청 (리더에게)
    ABSENCE_APPROVED,    // 불참 승인됨
    ABSENCE_REJECTED,    // 불참 거절됨

    // 탈퇴 관련
    WITHDRAWAL_REQUEST,  // 탈퇴 신청 (리더에게)
    WITHDRAWAL_APPROVED  // 탈퇴 승인됨
}
