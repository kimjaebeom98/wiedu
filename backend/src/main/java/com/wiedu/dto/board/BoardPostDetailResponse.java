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
        // 작성자가 삭제된 경우 "탈퇴한 사용자" 표시
        Long authorId = post.getAuthor() != null ? post.getAuthor().getId() : null;
        String authorNickname = post.getAuthor() != null ? post.getAuthor().getNickname() : "탈퇴한 사용자";
        String authorProfileImage = post.getAuthor() != null ? post.getAuthor().getProfileImage() : null;

        return new BoardPostDetailResponse(
            post.getId(),
            post.getCategory(),
            post.getTitle(),
            post.getContent(),
            authorId,
            authorNickname,
            authorProfileImage,
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
