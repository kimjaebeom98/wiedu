package com.wiedu.dto.user;

import com.wiedu.domain.entity.StudyMember;
import com.wiedu.domain.enums.MemberRole;

/**
 * 내 스터디 목록 응답 DTO
 */
public record MyStudyResponse(
        Long studyId,
        String title,
        String category,
        String thumbnailImage,
        String status,
        String myRole,
        int currentMembers,
        int maxMembers
) {
    public static MyStudyResponse from(StudyMember studyMember) {
        var study = studyMember.getStudy();

        String categoryName = study.getCategory() != null
                ? study.getCategory().getName()
                : null;

        String statusStr = study.getStatus() != null
                ? study.getStatus().name()
                : null;

        String roleStr = studyMember.getRole() != null
                ? studyMember.getRole().name()
                : MemberRole.MEMBER.name();

        return new MyStudyResponse(
                study.getId(),
                study.getTitle(),
                categoryName,
                study.getCoverImageUrl(),
                statusStr,
                roleStr,
                study.getCurrentMembers() != null ? study.getCurrentMembers() : 0,
                study.getMaxMembers() != null ? study.getMaxMembers() : 0
        );
    }
}
