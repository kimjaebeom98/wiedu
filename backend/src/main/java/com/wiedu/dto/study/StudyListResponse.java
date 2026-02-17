package com.wiedu.dto.study;

import com.wiedu.domain.entity.Study;
import com.wiedu.domain.enums.StudyMethod;
import com.wiedu.domain.enums.StudyStatus;

import java.time.LocalDateTime;

/**
 * 스터디 목록용 간략 응답 DTO
 * - 목록 조회 시 불필요한 정보 제외
 */
public record StudyListResponse(
        Long id,
        String title,
        String categoryName,
        String leaderNickname,
        Integer maxMembers,
        Integer currentMembers,
        StudyStatus status,
        String studyMethod,
        LocalDateTime createdAt
) {
    // Entity → DTO 변환
    public static StudyListResponse from(Study study) {
        return new StudyListResponse(
                study.getId(),
                study.getTitle(),
                study.getCategory().getName(),
                study.getLeader().getNickname(),
                study.getMaxMembers(),
                study.getCurrentMembers(),
                study.getStatus(),
                study.getStudyMethod() != null ? study.getStudyMethod().name() : null,
                study.getCreatedAt()
        );
    }
}
