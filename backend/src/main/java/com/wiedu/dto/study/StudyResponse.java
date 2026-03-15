package com.wiedu.dto.study;

import com.wiedu.domain.entity.Study;
import com.wiedu.domain.entity.StudyMember;
import com.wiedu.domain.entity.StudyRule;
import com.wiedu.domain.entity.StudyTag;
import com.wiedu.domain.enums.MemberRole;
import com.wiedu.domain.enums.MemberStatus;
import com.wiedu.domain.enums.StudyStatus;
import com.wiedu.dto.user.UserResponse;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 스터디 상세 응답 DTO
 */
public record StudyResponse(
        Long id,
        String title,
        String description,
        String categoryName,
        String subcategoryName,
        String coverImageUrl,
        List<String> tags,
        String targetAudience,
        String goals,
        UserResponse leader,
        Integer maxMembers,
        Integer currentMembers,
        StudyStatus status,
        String studyMethod,
        String platform,
        String daysOfWeek,
        String time,
        String durationType,
        String meetingRegion,
        String meetingCity,
        Integer deposit,
        String depositRefundPolicy,
        String requirements,
        List<CurriculumResponse> curriculums,
        List<RuleResponse> rules,
        LocalDateTime startDate,
        LocalDateTime endDate,
        LocalDateTime createdAt,
        // 멤버십 정보 (로그인 사용자 기준)
        Boolean isMember,
        String memberRole,
        // 멤버 목록 (활성 멤버)
        List<MemberInfo> members,
        // 북마크 여부
        Boolean isBookmarked
) {
    // Entity → DTO 변환 (비로그인 사용자용)
    public static StudyResponse from(Study study) {
        return from(study, null, null, null, null);
    }

    // Entity → DTO 변환 (로그인 사용자용 - 멤버십 정보 포함)
    public static StudyResponse from(Study study, Boolean isMember, MemberRole memberRole) {
        return from(study, isMember, memberRole, null, null);
    }

    // Entity → DTO 변환 (로그인 사용자용 - 멤버십 정보 + 멤버 목록 포함)
    public static StudyResponse from(Study study, Boolean isMember, MemberRole memberRole, List<StudyMember> studyMembers) {
        return from(study, isMember, memberRole, studyMembers, null);
    }

    // Entity → DTO 변환 (로그인 사용자용 - 멤버십 정보 + 멤버 목록 + 북마크 포함)
    public static StudyResponse from(Study study, Boolean isMember, MemberRole memberRole, List<StudyMember> studyMembers, Boolean isBookmarked) {
        List<MemberInfo> memberInfoList = null;
        if (studyMembers != null) {
            memberInfoList = studyMembers.stream()
                    .filter(m -> m.getStatus() == MemberStatus.ACTIVE)
                    .map(m -> new MemberInfo(
                            m.getUser().getId(),
                            m.getUser().getNickname(),
                            m.getUser().getProfileImage(),
                            m.getRole().name()
                    ))
                    .toList();
        }

        return new StudyResponse(
                study.getId(),
                study.getTitle(),
                study.getDescription(),
                study.getCategory().getName(),
                study.getSubcategory() != null ? study.getSubcategory().getName() : null,
                study.getCoverImageUrl(),
                study.getTags().stream().map(StudyTag::getTagName).toList(),
                study.getTargetAudience(),
                study.getGoals(),
                UserResponse.from(study.getLeader()),
                study.getMaxMembers(),
                study.getCurrentMembers(),
                study.getStatus(),
                study.getStudyMethod() != null ? study.getStudyMethod().name() : null,
                study.getPlatform(),
                study.getDaysOfWeek(),
                study.getTime(),
                study.getDurationType() != null ? study.getDurationType().name() : null,
                study.getMeetingRegion(),
                study.getMeetingCity(),
                study.getDeposit(),
                study.getDepositRefundPolicy(),
                study.getRequirements(),
                study.getCurriculums().stream()
                        .map(c -> new CurriculumResponse(c.getWeekNumber(), c.getTitle(), c.getContent()))
                        .toList(),
                study.getRules().stream()
                        .map(r -> new RuleResponse(r.getRuleOrder(), r.getContent()))
                        .toList(),
                study.getStartDate(),
                study.getEndDate(),
                study.getCreatedAt(),
                isMember,
                memberRole != null ? memberRole.name() : null,
                memberInfoList,
                isBookmarked
        );
    }

    public record CurriculumResponse(Integer weekNumber, String title, String content) {}
    public record RuleResponse(Integer ruleOrder, String content) {}
    public record MemberInfo(Long id, String nickname, String profileImage, String role) {}
}
