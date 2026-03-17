package com.wiedu.repository.board;

import com.wiedu.domain.entity.BoardComment;
import com.wiedu.domain.entity.BoardPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardCommentRepository extends JpaRepository<BoardComment, Long> {

    @Query("SELECT c FROM BoardComment c JOIN FETCH c.author WHERE c.post = :post ORDER BY c.createdAt ASC")
    List<BoardComment> findByPostWithAuthor(@Param("post") BoardPost post);

    void deleteAllByPost(BoardPost post);

    /**
     * 좋아요 수 atomic 증가 (Race Condition 방지)
     */
    @Modifying
    @Query("UPDATE BoardComment c SET c.likeCount = c.likeCount + 1 WHERE c.id = :id")
    void incrementLikeCount(@Param("id") Long id);

    /**
     * 좋아요 수 atomic 감소 (Race Condition 방지, 0 미만 방지)
     */
    @Modifying
    @Query("UPDATE BoardComment c SET c.likeCount = CASE WHEN c.likeCount > 0 THEN c.likeCount - 1 ELSE 0 END WHERE c.id = :id")
    void decrementLikeCount(@Param("id") Long id);

    /**
     * 사용자 삭제 시 작성자를 NULL로 설정 (알 수 없음 처리)
     */
    @Modifying
    @Query("UPDATE BoardComment c SET c.author = null WHERE c.author.id = :userId")
    void setAuthorToNull(@Param("userId") Long userId);

    /**
     * 사용자가 좋아요한 댓글들의 like_count 일괄 감소 (탈퇴 시 사용)
     */
    @Modifying
    @Query("UPDATE BoardComment c SET c.likeCount = CASE WHEN c.likeCount > 0 THEN c.likeCount - 1 ELSE 0 END " +
           "WHERE c.id IN (SELECT cl.comment.id FROM BoardCommentLike cl WHERE cl.user.id = :userId)")
    void decrementLikeCountByUserId(@Param("userId") Long userId);
}
