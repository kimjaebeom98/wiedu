package com.wiedu.dto.study;

import com.wiedu.domain.entity.Study;
import com.wiedu.domain.enums.StudyCategory;
import com.wiedu.domain.enums.StudyStatus;
import com.wiedu.dto.user.UserResponse;

import java.time.LocalDateTime;

/**
 * 스터디 상세 응답 DTO
 */
public record StudyResponse(
        Long id,
        String title,
        String description,
        StudyCategory category,
        UserResponse leader,
        Integer maxMembers,
        Integer currentMembers,
        StudyStatus status,
        String region,
        String detailedLocation,
        boolean online,
        String schedule,
        LocalDateTime startDate,
        LocalDateTime endDate,
        LocalDateTime createdAt
) {
    // Entity → DTO 변환
    public static StudyResponse from(Study study) {
        return new StudyResponse(
                study.getId(),
                study.getTitle(),
                study.getDescription(),
                study.getCategory(),
                UserResponse.from(study.getLeader()),
                study.getMaxMembers(),
                study.getCurrentMembers(),
                study.getStatus(),
                study.getRegion(),
                study.getDetailedLocation(),
                study.isOnline(),
                study.getSchedule(),
                study.getStartDate(),
                study.getEndDate(),
                study.getCreatedAt()
        );
    }
}
