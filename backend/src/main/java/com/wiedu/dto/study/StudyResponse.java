package com.wiedu.dto.study;

import com.wiedu.domain.entity.Study;
import com.wiedu.domain.entity.StudyCurriculum;
import com.wiedu.domain.entity.StudyRule;
import com.wiedu.domain.entity.StudyTag;
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
        Integer participationFee,
        Integer deposit,
        String depositRefundPolicy,
        String requirements,
        List<CurriculumResponse> curriculums,
        List<RuleResponse> rules,
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
                study.getParticipationFee(),
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
                study.getCreatedAt()
        );
    }

    public record CurriculumResponse(Integer weekNumber, String title, String content) {}
    public record RuleResponse(Integer ruleOrder, String content) {}
}
