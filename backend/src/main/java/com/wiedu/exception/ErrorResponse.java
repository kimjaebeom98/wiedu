package com.wiedu.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 통일된 에러 응답 형식
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        String code,
        String message,
        List<FieldError> errors,
        LocalDateTime timestamp
) {
    // 단순 에러 (필드 에러 없음)
    public static ErrorResponse of(String code, String message) {
        return new ErrorResponse(code, message, null, LocalDateTime.now());
    }

    // 필드 에러 포함 (Validation 실패 시)
    public static ErrorResponse of(String code, String message, List<FieldError> errors) {
        return new ErrorResponse(code, message, errors, LocalDateTime.now());
    }

    /**
     * 필드별 에러 정보
     */
    public record FieldError(
            String field,
            String value,
            String reason
    ) {
        public static FieldError of(String field, String value, String reason) {
            return new FieldError(field, value, reason);
        }
    }
}
