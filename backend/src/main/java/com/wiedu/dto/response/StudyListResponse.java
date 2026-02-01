package com.wiedu.dto.response;

import com.wiedu.domain.entity.Study;
import com.wiedu.domain.enums.StudyCategory;
import com.wiedu.domain.enums.StudyStatus;

import java.time.LocalDateTime;

/**
 * 스터디 목록용 간략 응답 DTO
 * - 목록 조회 시 불필요한 정보 제외
 */
public record StudyListResponse(
        Long id,
        String title,
        StudyCategory category,
        String leaderNickname,
        Integer maxMembers,
        Integer currentMembers,
        StudyStatus status,
        String region,
        boolean online,
        LocalDateTime createdAt
) {
    // Entity → DTO 변환
    public static StudyListResponse from(Study study) {
        return new StudyListResponse(
                study.getId(),
                study.getTitle(),
                study.getCategory(),
                study.getLeader().getNickname(),
                study.getMaxMembers(),
                study.getCurrentMembers(),
                study.getStatus(),
                study.getRegion(),
                study.isOnline(),
                study.getCreatedAt()
        );
    }
}
