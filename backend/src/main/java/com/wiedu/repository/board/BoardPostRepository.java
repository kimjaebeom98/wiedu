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

    // 검색 쿼리 - 제목 또는 내용에서 키워드 검색
    @Query(value = "SELECT p FROM BoardPost p JOIN FETCH p.author WHERE p.study = :study AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) ORDER BY p.createdAt DESC",
           countQuery = "SELECT COUNT(p) FROM BoardPost p WHERE p.study = :study AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<BoardPost> searchByKeyword(@Param("study") Study study, @Param("keyword") String keyword, Pageable pageable);

    // 카테고리 + 검색
    @Query(value = "SELECT p FROM BoardPost p JOIN FETCH p.author WHERE p.study = :study AND p.category = :category AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) ORDER BY p.createdAt DESC",
           countQuery = "SELECT COUNT(p) FROM BoardPost p WHERE p.study = :study AND p.category = :category AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<BoardPost> searchByKeywordAndCategory(@Param("study") Study study, @Param("category") PostCategory category, @Param("keyword") String keyword, Pageable pageable);
}
