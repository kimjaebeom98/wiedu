package com.wiedu.dto.study;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CurriculumRequest(
    @NotNull(message = "주차 번호는 필수입니다")
    Integer weekNumber,

    @NotBlank(message = "주차 제목은 필수입니다")
    @Size(max = 100, message = "제목은 100자 이하여야 합니다")
    String title,

    @Size(max = 2000, message = "내용은 2000자 이하여야 합니다")
    String content
) {}
