package com.wiedu.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * 에러 코드 정의
 */
@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // Common
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "C001", "잘못된 입력값입니다."),
    INVALID_TYPE_VALUE(HttpStatus.BAD_REQUEST, "C002", "잘못된 타입입니다."),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "C003", "리소스를 찾을 수 없습니다."),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "C004", "허용되지 않은 메서드입니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C005", "서버 오류가 발생했습니다."),

    // User
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "U001", "사용자를 찾을 수 없습니다."),
    EMAIL_DUPLICATED(HttpStatus.CONFLICT, "U002", "이미 사용 중인 이메일입니다."),
    NICKNAME_DUPLICATED(HttpStatus.CONFLICT, "U003", "이미 사용 중인 닉네임입니다."),
    INVALID_PASSWORD(HttpStatus.BAD_REQUEST, "U004", "비밀번호가 올바르지 않습니다."),

    // Study
    STUDY_NOT_FOUND(HttpStatus.NOT_FOUND, "S001", "스터디를 찾을 수 없습니다."),
    STUDY_NOT_RECRUITING(HttpStatus.BAD_REQUEST, "S002", "모집 중인 스터디가 아닙니다."),
    STUDY_FULL(HttpStatus.BAD_REQUEST, "S003", "스터디 정원이 가득 찼습니다."),
    NOT_STUDY_LEADER(HttpStatus.FORBIDDEN, "S004", "스터디 리더만 가능합니다."),

    // StudyMember
    ALREADY_MEMBER(HttpStatus.CONFLICT, "M001", "이미 가입된 스터디입니다."),
    NOT_MEMBER(HttpStatus.BAD_REQUEST, "M002", "스터디 멤버가 아닙니다."),
    LEADER_CANNOT_WITHDRAW(HttpStatus.BAD_REQUEST, "M003", "리더는 탈퇴할 수 없습니다."),
    CANNOT_KICK_SELF(HttpStatus.BAD_REQUEST, "M004", "자기 자신은 강제 탈퇴할 수 없습니다."),

    // StudyRequest
    REQUEST_NOT_FOUND(HttpStatus.NOT_FOUND, "R001", "가입 신청을 찾을 수 없습니다."),
    ALREADY_REQUESTED(HttpStatus.CONFLICT, "R002", "이미 가입 신청한 스터디입니다."),
    REQUEST_ALREADY_PROCESSED(HttpStatus.BAD_REQUEST, "R003", "이미 처리된 신청입니다."),
    NOT_REQUEST_OWNER(HttpStatus.FORBIDDEN, "R004", "본인의 신청만 취소할 수 있습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;
}
