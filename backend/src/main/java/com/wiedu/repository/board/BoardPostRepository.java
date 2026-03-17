package com.wiedu.repository.board;

import com.wiedu.domain.entity.BoardPost;
import com.wiedu.domain.entity.Study;
import com.wiedu.domain.enums.PostCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BoardPostRepository extends JpaRepository<BoardPost, Long> {

    @Query(value = "SELECT p FROM BoardPost p JOIN FETCH p.author WHERE p.study = :study ORDER BY p.createdAt DESC",
           countQuery = "SELECT COUNT(p) FROM BoardPost p WHERE p.study = :study")
    Page<BoardPost> findByStudyWithAuthor(@Param("study") Study study, Pageable pageable);

    @Query(value = "SELECT p FROM BoardPost p JOIN FETCH p.author WHERE p.study = :study AND p.category = :category ORDER BY p.createdAt DESC",
           countQuery = "SELECT COUNT(p) FROM BoardPost p WHERE p.study = :study AND p.category = :category")
    Page<BoardPost> findByStudyAndCategoryWithAuthor(@Param("study") Study study, @Param("category") PostCategory category, Pageable pageable);

    @Query("SELECT p FROM BoardPost p JOIN FETCH p.author JOIN FETCH p.study WHERE p.id = :id")
    Optional<BoardPost> findByIdWithDetails(@Param("id") Long id);

    @Modifying
    @Query("UPDATE BoardPost p SET p.viewCount = p.viewCount + 1 WHERE p.id = :id")
    void incrementViewCount(@Param("id") Long id);

    /**
     * 좋아요 수 atomic 증가 (Race Condition 방지)
     */
    @Modifying
    @Query("UPDATE BoardPost p SET p.likeCount = p.likeCount + 1 WHERE p.id = :id")
    void incrementLikeCount(@Param("id") Long id);

    /**
     * 좋아요 수 atomic 감소 (Race Condition 방지, 0 미만 방지)
     */
    @Modifying
    @Query("UPDATE BoardPost p SET p.likeCount = CASE WHEN p.likeCount > 0 THEN p.likeCount - 1 ELSE 0 END WHERE p.id = :id")
    void decrementLikeCount(@Param("id") Long id);

    // 검색 쿼리 - 제목 또는 내용에서 키워드 검색
    @Query(value = "SELECT p FROM BoardPost p JOIN FETCH p.author WHERE p.study = :study AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) ORDER BY p.createdAt DESC",
           countQuery = "SELECT COUNT(p) FROM BoardPost p WHERE p.study = :study AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<BoardPost> searchByKeyword(@Param("study") Study study, @Param("keyword") String keyword, Pageable pageable);

    // 카테고리 + 검색
    @Query(value = "SELECT p FROM BoardPost p JOIN FETCH p.author WHERE p.study = :study AND p.category = :category AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) ORDER BY p.createdAt DESC",
           countQuery = "SELECT COUNT(p) FROM BoardPost p WHERE p.study = :study AND p.category = :category AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<BoardPost> searchByKeywordAndCategory(@Param("study") Study study, @Param("category") PostCategory category, @Param("keyword") String keyword, Pageable pageable);

    /**
     * 사용자 삭제 시 작성자를 NULL로 설정 (알 수 없음 처리)
     */
    @Modifying
    @Query("UPDATE BoardPost p SET p.author = null WHERE p.author.id = :userId")
    void setAuthorToNull(@Param("userId") Long userId);

    /**
     * 사용자가 좋아요한 게시글들의 like_count 일괄 감소 (탈퇴 시 사용)
     */
    @Modifying
    @Query("UPDATE BoardPost p SET p.likeCount = CASE WHEN p.likeCount > 0 THEN p.likeCount - 1 ELSE 0 END " +
           "WHERE p.id IN (SELECT pl.post.id FROM BoardPostLike pl WHERE pl.user.id = :userId)")
    void decrementLikeCountByUserId(@Param("userId") Long userId);
}
