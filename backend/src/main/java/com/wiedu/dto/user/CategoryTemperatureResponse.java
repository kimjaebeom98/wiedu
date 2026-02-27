package com.wiedu.dto.user;

import com.wiedu.domain.enums.InterestType;

import java.math.BigDecimal;
import java.util.Map;

public record CategoryTemperatureResponse(
        String category,
        String label,
        BigDecimal temperature,
        Integer studyCount
) {
    private static final Map<InterestType, String> LABELS = Map.of(
            InterestType.IT_DEV, "IT/개발",
            InterestType.LANGUAGE, "어학",
            InterestType.CERTIFICATION, "자격증",
            InterestType.CAREER, "취업/이직",
            InterestType.CIVIL_SERVICE, "공무원/고시",
            InterestType.FINANCE, "재테크",
            InterestType.DESIGN, "디자인",
            InterestType.BUSINESS, "비즈니스"
    );

    public static CategoryTemperatureResponse of(InterestType category, BigDecimal temperature, Integer studyCount) {
        return new CategoryTemperatureResponse(
                category.name(),
                LABELS.getOrDefault(category, category.name()),
                temperature,
                studyCount
        );
    }
}
