package com.wiedu.dto.curriculum;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CurriculumUpdateRequest(
    @NotBlank(message = "제목은 필수입니다")
    @Size(max = 100, message = "제목은 100자 이하여야 합니다")
    String title,

    @Size(max = 2000, message = "내용은 2000자 이하여야 합니다")
    String content
) {}
