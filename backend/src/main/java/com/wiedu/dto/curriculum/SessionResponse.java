package com.wiedu.dto.curriculum;

import com.wiedu.domain.entity.CurriculumSession;
import com.wiedu.domain.enums.SessionMode;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record SessionResponse(
    Long id,
    Long curriculumId,
    Integer sessionNumber,
    String title,
    String content,
    LocalDate sessionDate,
    LocalTime sessionTime,
    SessionMode sessionMode,
    String meetingLink,
    String meetingLocation,
    Double meetingLatitude,
    Double meetingLongitude,
    String meetingPlaceName,
    Boolean cancelled,
    String cancellationReason,
    LocalDateTime cancelledAt
) {
    public static SessionResponse from(CurriculumSession session) {
        return new SessionResponse(
            session.getId(),
            session.getCurriculum().getId(),
            session.getSessionNumber(),
            session.getTitle(),
            session.getContent(),
            session.getSessionDate(),
            session.getSessionTime(),
            session.getSessionMode(),
            session.getMeetingLink(),
            session.getMeetingLocation(),
            session.getMeetingLatitude(),
            session.getMeetingLongitude(),
            session.getMeetingPlaceName(),
            session.isCancelled(),
            session.getCancellationReason(),
            session.getCancelledAt()
        );
    }
}
