package com.wiedu.dto.user;

import java.util.List;

public record ProfileUpdateRequest(
        String nickname,
        String bio,
        String region,
        Double latitude,
        Double longitude,
        List<String> interests
) {}
