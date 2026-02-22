package com.wiedu.dto.board;

import jakarta.validation.constraints.NotBlank;

public record BoardCommentUpdateRequest(
    @NotBlank(message = "내용은 필수입니다")
    String content
) {}
