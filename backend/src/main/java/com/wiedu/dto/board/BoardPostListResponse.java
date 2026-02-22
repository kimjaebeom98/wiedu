package com.wiedu.dto.board;

import com.wiedu.domain.entity.BoardPost;
import com.wiedu.domain.enums.PostCategory;
import java.time.LocalDateTime;

public record BoardPostListResponse(
    Long id,
    PostCategory category,
    String title,
    String preview,
    Long authorId,
    String authorNickname,
    String authorProfileImage,
    int viewCount,
    int commentCount,
    int likeCount,
    boolean isLiked,
    LocalDateTime createdAt
) {
    public static BoardPostListResponse from(BoardPost post) {
        return from(post, false);
    }

    public static BoardPostListResponse from(BoardPost post, boolean isLiked) {
        String preview = post.getContent();
        if (preview.length() > 100) {
            preview = preview.substring(0, 100) + "...";
        }
        return new BoardPostListResponse(
            post.getId(),
            post.getCategory(),
            post.getTitle(),
            preview,
            post.getAuthor().getId(),
            post.getAuthor().getNickname(),
            post.getAuthor().getProfileImage(),
            post.getViewCount(),
            post.getCommentCount(),
            post.getLikeCount(),
            isLiked,
            post.getCreatedAt()
        );
    }
}
