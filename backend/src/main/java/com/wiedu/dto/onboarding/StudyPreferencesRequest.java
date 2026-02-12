package com.wiedu.dto.onboarding;

import com.wiedu.domain.enums.StudyType;
import lombok.Getter;

import java.util.List;

@Getter
public class StudyPreferencesRequest {
    private List<StudyType> studyTypes;
}
