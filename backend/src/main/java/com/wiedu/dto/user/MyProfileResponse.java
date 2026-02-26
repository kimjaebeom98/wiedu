package com.wiedu.dto.user;

import java.math.BigDecimal;

public record MyProfileResponse(
        Long id,
        String email,
        String nickname,
        String profileImage,
        BigDecimal temperature,
        String experienceLevel,
        String region,
        boolean onboardingCompleted,
        ActivityStatsResponse stats,
        boolean isStudyLeaderUnlocked,  // 온도 >= 40이면 true
        BigDecimal temperatureToUnlock  // 40 - 현재온도 (이미 해금된 경우 0)
) {}
