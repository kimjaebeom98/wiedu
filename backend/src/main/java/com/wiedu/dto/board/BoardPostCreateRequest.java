package com.wiedu.dto.board;

import com.wiedu.domain.enums.PostCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record BoardPostCreateRequest(
    @NotNull(message = "카테고리는 필수입니다")
    PostCategory category,

    @NotBlank(message = "제목은 필수입니다")
    @Size(max = 200, message = "제목은 200자 이내여야 합니다")
    String title,

    @NotBlank(message = "내용은 필수입니다")
    @Size(max = 10000, message = "내용은 10000자 이내여야 합니다")
    String content
) {}
