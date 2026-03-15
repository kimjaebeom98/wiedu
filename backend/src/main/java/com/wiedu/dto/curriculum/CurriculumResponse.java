package com.wiedu.dto.curriculum;

import com.wiedu.domain.entity.StudyCurriculum;

import java.util.List;

public record CurriculumResponse(
    Long id,
    Long studyId,
    Integer weekNumber,
    String title,
    String content,
    int sessionCount,
    List<SessionResponse> sessions
) {
    public static CurriculumResponse from(StudyCurriculum curriculum, List<SessionResponse> sessions) {
        return new CurriculumResponse(
            curriculum.getId(),
            curriculum.getStudy().getId(),
            curriculum.getWeekNumber(),
            curriculum.getTitle(),
            curriculum.getContent(),
            sessions != null ? sessions.size() : 0,
            sessions
        );
    }

    public static CurriculumResponse fromWithoutSessions(StudyCurriculum curriculum, int sessionCount) {
        return new CurriculumResponse(
            curriculum.getId(),
            curriculum.getStudy().getId(),
            curriculum.getWeekNumber(),
            curriculum.getTitle(),
            curriculum.getContent(),
            sessionCount,
            null
        );
    }
}
