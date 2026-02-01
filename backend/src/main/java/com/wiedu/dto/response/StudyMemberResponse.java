package com.wiedu.dto.response;

import com.wiedu.domain.entity.StudyMember;
import com.wiedu.domain.enums.MemberRole;
import com.wiedu.domain.enums.MemberStatus;

import java.time.LocalDateTime;

/**
 * 스터디 멤버 응답 DTO
 */
public record StudyMemberResponse(
        Long id,
        Long studyId,
        Long userId,
        String userNickname,
        String userProfileImage,
        MemberRole role,
        MemberStatus status,
        LocalDateTime joinedAt
) {
    // Entity → DTO 변환
    public static StudyMemberResponse from(StudyMember member) {
        return new StudyMemberResponse(
                member.getId(),
                member.getStudy().getId(),
                member.getUser().getId(),
                member.getUser().getNickname(),
                member.getUser().getProfileImage(),
                member.getRole(),
                member.getStatus(),
                member.getJoinedAt()
        );
    }
}
