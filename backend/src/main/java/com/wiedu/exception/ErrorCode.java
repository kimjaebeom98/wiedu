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
    TERMS_NOT_AGREED(HttpStatus.BAD_REQUEST, "U005", "필수 약관에 동의해야 합니다."),

    // Study
    STUDY_NOT_FOUND(HttpStatus.NOT_FOUND, "S001", "스터디를 찾을 수 없습니다."),
    STUDY_NOT_RECRUITING(HttpStatus.BAD_REQUEST, "S002", "모집 중인 스터디가 아닙니다."),
    STUDY_FULL(HttpStatus.BAD_REQUEST, "S003", "스터디 정원이 가득 찼습니다."),
    NOT_STUDY_LEADER(HttpStatus.FORBIDDEN, "S004", "스터디 리더만 가능합니다."),

    // Study Creation
    CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, "S005", "카테고리를 찾을 수 없습니다."),
    SUBCATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, "S006", "서브카테고리를 찾을 수 없습니다."),
    SUBCATEGORY_NOT_IN_CATEGORY(HttpStatus.BAD_REQUEST, "S007", "선택한 서브카테고리가 해당 카테고리에 속하지 않습니다."),

    // StudyMember
    ALREADY_MEMBER(HttpStatus.CONFLICT, "M001", "이미 가입된 스터디입니다."),
    NOT_MEMBER(HttpStatus.BAD_REQUEST, "M002", "스터디 멤버가 아닙니다."),
    LEADER_CANNOT_WITHDRAW(HttpStatus.BAD_REQUEST, "M003", "리더는 탈퇴할 수 없습니다."),
    CANNOT_KICK_SELF(HttpStatus.BAD_REQUEST, "M004", "자기 자신은 강제 탈퇴할 수 없습니다."),
    CANNOT_DELEGATE_TO_WITHDRAWN(HttpStatus.BAD_REQUEST, "M005", "탈퇴한 멤버에게 리더를 위임할 수 없습니다."),
    NEW_LEADER_MUST_BE_MEMBER(HttpStatus.BAD_REQUEST, "M006", "새 리더는 스터디 멤버여야 합니다."),

    // StudyRequest
    REQUEST_NOT_FOUND(HttpStatus.NOT_FOUND, "R001", "가입 신청을 찾을 수 없습니다."),
    ALREADY_REQUESTED(HttpStatus.CONFLICT, "R002", "이미 가입 신청한 스터디입니다."),
    REQUEST_ALREADY_PROCESSED(HttpStatus.BAD_REQUEST, "R003", "이미 처리된 신청입니다."),
    NOT_REQUEST_OWNER(HttpStatus.FORBIDDEN, "R004", "본인의 신청만 취소할 수 있습니다."),

    // Authentication
    AUTH_INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "A001", "이메일 또는 비밀번호가 올바르지 않습니다."),
    AUTH_TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "A002", "토큰이 만료되었습니다."),
    AUTH_TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "A003", "유효하지 않은 토큰입니다."),
    AUTH_TOKEN_MISSING(HttpStatus.UNAUTHORIZED, "A004", "인증 토큰이 필요합니다."),
    AUTH_ACCESS_DENIED(HttpStatus.FORBIDDEN, "A005", "접근 권한이 없습니다."),
    AUTH_USER_DISABLED(HttpStatus.UNAUTHORIZED, "A006", "비활성화된 계정입니다."),

    // OAuth
    OAUTH_TOKEN_FAILED(HttpStatus.UNAUTHORIZED, "O001", "OAuth 토큰 발급에 실패했습니다."),
    OAUTH_USER_INFO_FAILED(HttpStatus.UNAUTHORIZED, "O002", "OAuth 사용자 정보 조회에 실패했습니다."),
    OAUTH_INVALID_PROVIDER(HttpStatus.BAD_REQUEST, "O003", "지원하지 않는 OAuth 제공자입니다."),

    // Board
    BOARD_POST_NOT_FOUND(HttpStatus.NOT_FOUND, "B001", "게시글을 찾을 수 없습니다."),
    BOARD_COMMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "B002", "댓글을 찾을 수 없습니다."),
    NOT_POST_AUTHOR(HttpStatus.FORBIDDEN, "B003", "게시글 작성자만 삭제할 수 있습니다."),
    NOT_COMMENT_AUTHOR(HttpStatus.FORBIDDEN, "B004", "댓글 작성자만 삭제할 수 있습니다."),
    NOTICE_LEADER_ONLY(HttpStatus.FORBIDDEN, "B005", "공지는 스터디 리더만 작성할 수 있습니다."),
    NOT_STUDY_MEMBER(HttpStatus.FORBIDDEN, "B006", "스터디 멤버만 접근할 수 있습니다."),

    // Gallery
    GALLERY_PHOTO_NOT_FOUND(HttpStatus.NOT_FOUND, "G001", "사진을 찾을 수 없습니다."),
    GALLERY_NOT_PHOTO_OWNER(HttpStatus.FORBIDDEN, "G002", "사진 업로더 또는 리더만 삭제할 수 있습니다."),
    GALLERY_FILE_EMPTY(HttpStatus.BAD_REQUEST, "G003", "업로드할 파일이 없습니다."),
    GALLERY_FILE_TOO_LARGE(HttpStatus.BAD_REQUEST, "G004", "파일 크기가 제한을 초과했습니다."),
    GALLERY_INVALID_FILE_TYPE(HttpStatus.BAD_REQUEST, "G005", "지원하지 않는 파일 형식입니다."),
    GALLERY_UPLOAD_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "G006", "파일 업로드에 실패했습니다."),

    // Review
    REVIEW_NOT_FOUND(HttpStatus.NOT_FOUND, "RV001", "리뷰를 찾을 수 없습니다."),
    REVIEW_ALREADY_EXISTS(HttpStatus.CONFLICT, "RV002", "이미 이 스터디에 리뷰를 작성했습니다."),
    REVIEW_NOT_MEMBER(HttpStatus.FORBIDDEN, "RV003", "스터디 멤버만 리뷰를 작성할 수 있습니다."),
    REVIEW_INVALID_RATING(HttpStatus.BAD_REQUEST, "RV004", "평점은 1~5점 사이여야 합니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;
}
