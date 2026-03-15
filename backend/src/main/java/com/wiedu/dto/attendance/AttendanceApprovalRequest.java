package com.wiedu.dto.attendance;

import jakarta.validation.constraints.Size;

public record AttendanceApprovalRequest(
    boolean approved,

    @Size(max = 500, message = "거절 사유는 500자 이하로 입력해주세요")
    String comment
) {
}
