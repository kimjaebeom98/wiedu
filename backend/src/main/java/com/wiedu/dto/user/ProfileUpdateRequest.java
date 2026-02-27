package com.wiedu.dto.user;

import java.util.List;

public record ProfileUpdateRequest(
        String nickname,
        String bio,
        String region,
        List<String> interests
) {}
