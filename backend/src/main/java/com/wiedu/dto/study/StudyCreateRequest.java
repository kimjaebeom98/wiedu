package com.wiedu.dto.study;

import com.wiedu.domain.enums.DurationType;
import com.wiedu.domain.enums.StudyMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.util.List;

public record StudyCreateRequest(
    // Step 1: Basic Info
    @NotBlank(message = "스터디 제목은 필수입니다")
    @Size(max = 100, message = "제목은 100자 이하여야 합니다")
    String title,

    @NotNull(message = "카테고리는 필수입니다")
    Long categoryId,

    Long subcategoryId,

    @Size(max = 500, message = "이미지 URL은 500자 이하여야 합니다")
    String coverImageUrl,

    @Size(max = 5, message = "태그는 최대 5개까지 가능합니다")
    List<String> tags,

    // Step 2: Detail Description
    @NotBlank(message = "스터디 소개는 필수입니다")
    @Size(max = 2000, message = "소개는 2000자 이하여야 합니다")
    String description,

    @Size(max = 1000, message = "대상 설명은 1000자 이하여야 합니다")
    String targetAudience,

    @Size(max = 1000, message = "학습 목표는 1000자 이하여야 합니다")
    String goals,

    // Step 3: Schedule & Method
    @NotNull(message = "진행 방식은 필수입니다")
    StudyMethod studyMethod,

    List<String> daysOfWeek,

    String time,

    DurationType durationType,

    String platform,

    // Step 4: Recruitment Settings
    @NotNull(message = "최대 인원은 필수입니다")
    @Min(value = 2, message = "최소 2명 이상이어야 합니다")
    @Max(value = 50, message = "최대 50명까지 가능합니다")
    Integer maxMembers,

    @Min(value = 0, message = "보증금은 0 이상이어야 합니다")
    Integer deposit,

    String depositRefundPolicy,

    @Size(max = 1000, message = "요구사항은 1000자 이하여야 합니다")
    String requirements,

    // Step 5: Curriculum & Rules
    @Size(max = 24, message = "커리큘럼은 최대 24주까지 가능합니다")
    @Valid
    List<CurriculumRequest> curriculums,

    @Size(max = 10, message = "규칙은 최대 10개까지 가능합니다")
    @Valid
    List<RuleRequest> rules,

    // Optional dates
    LocalDateTime startDate,
    LocalDateTime endDate,

    // Location
    String meetingLocation,
    Double meetingLatitude,
    Double meetingLongitude
) {}
