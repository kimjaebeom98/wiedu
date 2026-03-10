package com.wiedu.domain.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 사용자 뱃지 타입
 * 우선순위: CHAMPION > POPULAR > KIND > PASSION > NEWBIE
 */
@Getter
@RequiredArgsConstructor
public enum BadgeType {

    CHAMPION(1, "챔피언", "🏆", "#F59E0B", "완료 스터디 10개 이상"),
    POPULAR(2, "인기인", "⭐", "#3B82F6", "평균 리뷰 4.5점 이상"),
    KIND(3, "친절", "♥", "#EC4899", "매너온도 40도 이상"),
    PASSION(4, "열정", "⚡", "#22C55E", "연속 7일 로그인"),
    NEWBIE(5, "새싹", "🌱", "#10B981", "가입 7일 이내");

    private final int priority;      // 낮을수록 높은 우선순위
    private final String displayName;
    private final String emoji;
    private final String color;
    private final String description;
}
