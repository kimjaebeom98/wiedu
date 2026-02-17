package com.wiedu.dto.study;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RuleRequest(
    @NotNull(message = "규칙 순서는 필수입니다")
    Integer ruleOrder,

    @NotBlank(message = "규칙 내용은 필수입니다")
    @Size(max = 200, message = "규칙은 200자 이하여야 합니다")
    String content
) {}
