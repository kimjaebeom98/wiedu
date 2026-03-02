package com.wiedu.repository.board;

import com.wiedu.domain.entity.BoardPost;
import com.wiedu.domain.entity.BoardPostLike;
import com.wiedu.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface BoardPostLikeRepository extends JpaRepository<BoardPostLike, Long> {

    Optional<BoardPostLike> findByPostAndUser(BoardPost post, User user);

    boolean existsByPostAndUser(BoardPost post, User user);

    @Query("SELECT COUNT(l) FROM BoardPostLike l WHERE l.post = :post")
    int countByPost(@Param("post") BoardPost post);

    void deleteByPostAndUser(BoardPost post, User user);

    /**
     * 여러 게시글에 대해 사용자가 좋아요한 게시글 ID 목록 조회 (N+1 방지)
     */
    @Query("SELECT l.post.id FROM BoardPostLike l WHERE l.user = :user AND l.post.id IN :postIds")
    Set<Long> findLikedPostIdsByUserAndPostIds(@Param("user") User user, @Param("postIds") List<Long> postIds);
}
