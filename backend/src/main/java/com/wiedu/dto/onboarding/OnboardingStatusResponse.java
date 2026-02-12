package com.wiedu.dto.onboarding;

import com.wiedu.domain.enums.ExperienceLevel;
import com.wiedu.domain.enums.InterestType;
import com.wiedu.domain.enums.StudyType;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class OnboardingStatusResponse {
    private boolean termsAgreed;
    private boolean profileSet;
    private List<InterestType> interests;
    private ExperienceLevel experienceLevel;
    private List<StudyType> studyPreferences;
    private String region;
    private boolean pushNotificationEnabled;
    private boolean chatNotificationEnabled;
    private boolean studyNotificationEnabled;
    private boolean onboardingCompleted;
    private int currentStep;  // 1-8
}
