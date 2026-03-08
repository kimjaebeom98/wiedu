package com.wiedu.dto.study;

import com.wiedu.domain.entity.Study;
import com.wiedu.domain.entity.StudyMember;
import com.wiedu.domain.enums.StudyMethod;
import com.wiedu.domain.enums.StudyStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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
        String meetingRegion,
        String meetingCity,
        LocalDateTime createdAt,
        List<String> memberProfileImages
) {
    // Entity → DTO 변환
    public static StudyListResponse from(Study study) {
        // 멤버 프로필 이미지 추출 (최대 4명)
        List<String> profileImages = study.getMembers().stream()
                .limit(4)
                .map(member -> member.getUser().getProfileImage())
                .collect(Collectors.toList());

        return new StudyListResponse(
                study.getId(),
                study.getTitle(),
                study.getCategory().getName(),
                study.getLeader().getNickname(),
                study.getMaxMembers(),
                study.getCurrentMembers(),
                study.getStatus(),
                study.getStudyMethod() != null ? study.getStudyMethod().name() : null,
                study.getMeetingRegion(),
                study.getMeetingCity(),
                study.getCreatedAt(),
                profileImages
        );
    }
}
