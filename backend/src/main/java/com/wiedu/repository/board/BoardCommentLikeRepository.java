package com.wiedu.repository.board;

import com.wiedu.domain.entity.BoardComment;
import com.wiedu.domain.entity.BoardCommentLike;
import com.wiedu.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BoardCommentLikeRepository extends JpaRepository<BoardCommentLike, Long> {

    Optional<BoardCommentLike> findByCommentAndUser(BoardComment comment, User user);

    boolean existsByCommentAndUser(BoardComment comment, User user);

    @Query("SELECT COUNT(l) FROM BoardCommentLike l WHERE l.comment = :comment")
    int countByComment(@Param("comment") BoardComment comment);

    void deleteByCommentAndUser(BoardComment comment, User user);
}
