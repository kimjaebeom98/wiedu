package com.wiedu.dto.study;

import com.wiedu.domain.entity.WithdrawalRequest;
import com.wiedu.domain.enums.RequestStatus;

import java.time.LocalDateTime;

/**
 * 스터디 탈퇴 신청 응답 DTO
 */
public record WithdrawalRequestResponse(
        Long id,
        Long studyId,
        String studyTitle,
        Long userId,
        String userNickname,
        String userProfileImage,
        String reason,
        RequestStatus status,
        LocalDateTime createdAt,
        LocalDateTime processedAt
) {
    // Entity → DTO 변환
    public static WithdrawalRequestResponse from(WithdrawalRequest request) {
        return new WithdrawalRequestResponse(
                request.getId(),
                request.getStudy().getId(),
                request.getStudy().getTitle(),
                request.getUser().getId(),
                request.getUser().getNickname(),
                request.getUser().getProfileImage(),
                request.getReason(),
                request.getStatus(),
                request.getCreatedAt(),
                request.getProcessedAt()
        );
    }
}
