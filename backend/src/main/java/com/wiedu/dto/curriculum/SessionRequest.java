package com.wiedu.dto.curriculum;

import com.wiedu.domain.enums.SessionMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public record SessionRequest(
    @NotNull(message = "회차 번호는 필수입니다")
    Integer sessionNumber,

    @NotBlank(message = "제목은 필수입니다")
    @Size(max = 100, message = "제목은 100자 이하여야 합니다")
    String title,

    @Size(max = 2000, message = "내용은 2000자 이하여야 합니다")
    String content,

    LocalDate sessionDate,

    LocalTime sessionTime,

    @NotNull(message = "진행 방식은 필수입니다")
    SessionMode sessionMode,

    @Size(max = 500, message = "링크는 500자 이하여야 합니다")
    String meetingLink,

    @Size(max = 200, message = "장소는 200자 이하여야 합니다")
    String meetingLocation
) {}
