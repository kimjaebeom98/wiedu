package com.wiedu.domain.enums;

/**
 * 사용자 상태
 */
public enum UserStatus {
    ACTIVE,      // 활성 (정상 사용자)
    INACTIVE,    // 비활성 (휴면 계정)
    BANNED,      // 정지 (규정 위반)
    WITHDRAWN    // 탈퇴
}
