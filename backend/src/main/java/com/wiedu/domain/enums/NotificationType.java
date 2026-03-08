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
    NEW_REVIEW           // 새 리뷰가 등록됨
}
