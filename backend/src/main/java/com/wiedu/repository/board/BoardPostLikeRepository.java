package com.wiedu.repository.board;

import com.wiedu.domain.entity.BoardPost;
import com.wiedu.domain.entity.BoardPostLike;
import com.wiedu.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BoardPostLikeRepository extends JpaRepository<BoardPostLike, Long> {

    Optional<BoardPostLike> findByPostAndUser(BoardPost post, User user);

    boolean existsByPostAndUser(BoardPost post, User user);

    @Query("SELECT COUNT(l) FROM BoardPostLike l WHERE l.post = :post")
    int countByPost(@Param("post") BoardPost post);

    void deleteByPostAndUser(BoardPost post, User user);
}
