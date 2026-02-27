package com.wiedu.dto.user;

import java.math.BigDecimal;
import java.util.List;

public record MyProfileResponse(
        Long id,
        String email,
        String nickname,
        String profileImage,
        String bio,
        BigDecimal temperature,
        String experienceLevel,
        String region,
        List<String> interests,
        boolean onboardingCompleted,
        ActivityStatsResponse stats,
        boolean isStudyLeaderUnlocked,  // 온도 >= 40이면 true
        BigDecimal temperatureToUnlock  // 40 - 현재온도 (이미 해금된 경우 0)
) {}
