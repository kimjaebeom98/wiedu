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
        return new BoardCommentResponse(
            comment.getId(),
            comment.getContent(),
            comment.getAuthor().getId(),
            comment.getAuthor().getNickname(),
            comment.getAuthor().getProfileImage(),
            comment.getLikeCount(),
            isLiked,
            comment.getCreatedAt(),
            comment.getUpdatedAt()
        );
    }
}
