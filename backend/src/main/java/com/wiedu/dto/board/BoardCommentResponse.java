package com.wiedu.dto.board;

import com.wiedu.domain.entity.BoardComment;
import java.time.LocalDateTime;

public record BoardCommentResponse(
    Long id,
    String content,
    Long authorId,
    String authorNickname,
    String authorProfileImage,
    int likeCount,
    boolean isLiked,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static BoardCommentResponse from(BoardComment comment) {
        return from(comment, false);
    }

    public static BoardCommentResponse from(BoardComment comment, boolean isLiked) {
        // 작성자가 삭제된 경우 "탈퇴한 사용자" 표시
        Long authorId = comment.getAuthor() != null ? comment.getAuthor().getId() : null;
        String authorNickname = comment.getAuthor() != null ? comment.getAuthor().getNickname() : "탈퇴한 사용자";
        String authorProfileImage = comment.getAuthor() != null ? comment.getAuthor().getProfileImage() : null;

        return new BoardCommentResponse(
            comment.getId(),
            comment.getContent(),
            authorId,
            authorNickname,
            authorProfileImage,
            comment.getLikeCount(),
            isLiked,
            comment.getCreatedAt(),
            comment.getUpdatedAt()
        );
    }
}
