package com.wiedu.dto.gallery;

import jakarta.validation.constraints.Size;

public record GalleryPhotoUpdateRequest(
    @Size(max = 500, message = "캡션은 500자를 초과할 수 없습니다")
    String caption
) {}
