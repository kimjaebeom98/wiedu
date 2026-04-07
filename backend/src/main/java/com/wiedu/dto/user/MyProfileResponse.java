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
        Double latitude,
        Double longitude,
        List<String> interests,
        boolean onboardingCompleted,
        ActivityStatsResponse stats
) {}
