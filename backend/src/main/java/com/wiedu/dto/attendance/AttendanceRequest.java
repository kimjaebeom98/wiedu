package com.wiedu.dto.attendance;

import jakarta.validation.constraints.Size;

public record AttendanceRequest(
    boolean attending,

    @Size(max = 500, message = "불참 사유는 500자 이하로 입력해주세요")
    String absenceReason
) {
}
