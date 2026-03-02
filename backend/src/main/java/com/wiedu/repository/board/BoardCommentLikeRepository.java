package com.wiedu.repository.board;

import com.wiedu.domain.entity.BoardComment;
import com.wiedu.domain.entity.BoardCommentLike;
import com.wiedu.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface BoardCommentLikeRepository extends JpaRepository<BoardCommentLike, Long> {

    Optional<BoardCommentLike> findByCommentAndUser(BoardComment comment, User user);

    boolean existsByCommentAndUser(BoardComment comment, User user);

    @Query("SELECT COUNT(l) FROM BoardCommentLike l WHERE l.comment = :comment")
    int countByComment(@Param("comment") BoardComment comment);

    void deleteByCommentAndUser(BoardComment comment, User user);

    /**
     * 여러 댓글에 대해 사용자가 좋아요한 댓글 ID 목록 조회 (N+1 방지)
     */
    @Query("SELECT l.comment.id FROM BoardCommentLike l WHERE l.user = :user AND l.comment.id IN :commentIds")
    Set<Long> findLikedCommentIdsByUserAndCommentIds(@Param("user") User user, @Param("commentIds") List<Long> commentIds);
}
