package com.wiedu.dto.board;

import com.wiedu.domain.entity.BoardPost;
import com.wiedu.domain.enums.PostCategory;
import java.time.LocalDateTime;
import java.util.List;

public record BoardPostDetailResponse(
    Long id,
    PostCategory category,
    String title,
    String content,
    Long authorId,
    String authorNickname,
    String authorProfileImage,
    int viewCount,
    int commentCount,
    int likeCount,
    boolean isLiked,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    List<BoardCommentResponse> comments
) {
    public static BoardPostDetailResponse from(BoardPost post, List<BoardCommentResponse> comments) {
        return from(post, comments, false);
    }

    public static BoardPostDetailResponse from(BoardPost post, List<BoardCommentResponse> comments, boolean isLiked) {
        return new BoardPostDetailResponse(
            post.getId(),
            post.getCategory(),
            post.getTitle(),
            post.getContent(),
            post.getAuthor().getId(),
            post.getAuthor().getNickname(),
            post.getAuthor().getProfileImage(),
            post.getViewCount(),
            post.getCommentCount(),
            post.getLikeCount(),
            isLiked,
            post.getCreatedAt(),
            post.getUpdatedAt(),
            comments
        );
    }
}
