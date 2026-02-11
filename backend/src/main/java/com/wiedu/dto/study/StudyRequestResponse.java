package com.wiedu.dto.study;

import com.wiedu.domain.entity.StudyRequest;
import com.wiedu.domain.enums.RequestStatus;

import java.time.LocalDateTime;

/**
 * 스터디 가입 신청 응답 DTO
 */
public record StudyRequestResponse(
        Long id,
        Long studyId,
        String studyTitle,
        Long userId,
        String userNickname,
        String userProfileImage,
        String message,
        RequestStatus status,
        String rejectReason,
        LocalDateTime createdAt,
        LocalDateTime processedAt
) {
    // Entity → DTO 변환
    public static StudyRequestResponse from(StudyRequest request) {
        return new StudyRequestResponse(
                request.getId(),
                request.getStudy().getId(),
                request.getStudy().getTitle(),
                request.getUser().getId(),
                request.getUser().getNickname(),
                request.getUser().getProfileImage(),
                request.getMessage(),
                request.getStatus(),
                request.getRejectReason(),
                request.getCreatedAt(),
                request.getProcessedAt()
        );
    }
}
