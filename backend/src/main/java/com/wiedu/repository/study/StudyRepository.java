package com.wiedu.repository.study;

import com.wiedu.domain.entity.Study;
import com.wiedu.domain.entity.User;
import com.wiedu.domain.enums.StudyCategory;
import com.wiedu.domain.enums.StudyStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * 스터디 Repository
 */
public interface StudyRepository extends JpaRepository<Study, Long> {

    // ID로 조회 (리더 포함)
    @Query("SELECT s FROM Study s JOIN FETCH s.leader WHERE s.id = :id")
    Optional<Study> findByIdWithLeader(@Param("id") Long id);

    // 전체 목록 (리더 포함, 페이징)
    @Query(value = "SELECT s FROM Study s JOIN FETCH s.leader",
           countQuery = "SELECT COUNT(s) FROM Study s")
    Page<Study> findAllWithLeader(Pageable pageable);

    // 상태별 스터디 목록 (리더 포함, 페이징)
    @Query(value = "SELECT s FROM Study s JOIN FETCH s.leader WHERE s.status = :status",
           countQuery = "SELECT COUNT(s) FROM Study s WHERE s.status = :status")
    Page<Study> findByStatusWithLeader(@Param("status") StudyStatus status, Pageable pageable);

    // 카테고리별 스터디 목록 (리더 포함, 페이징)
    @Query(value = "SELECT s FROM Study s JOIN FETCH s.leader WHERE s.category = :category",
           countQuery = "SELECT COUNT(s) FROM Study s WHERE s.category = :category")
    Page<Study> findByCategoryWithLeader(@Param("category") StudyCategory category, Pageable pageable);

    // 제목 또는 설명으로 검색 (리더 포함, 페이징)
    @Query(value = "SELECT s FROM Study s JOIN FETCH s.leader WHERE s.title LIKE %:keyword% OR s.description LIKE %:keyword%",
           countQuery = "SELECT COUNT(s) FROM Study s WHERE s.title LIKE %:keyword% OR s.description LIKE %:keyword%")
    Page<Study> searchByKeywordWithLeader(@Param("keyword") String keyword, Pageable pageable);

    // 상태별 스터디 목록 (페이징) - 기존 유지
    Page<Study> findByStatus(StudyStatus status, Pageable pageable);

    // 카테고리별 스터디 목록 (페이징) - 기존 유지
    Page<Study> findByCategory(StudyCategory category, Pageable pageable);

    // 카테고리 + 상태로 조회 (페이징)
    Page<Study> findByCategoryAndStatus(StudyCategory category, StudyStatus status, Pageable pageable);

    // 리더(스터디장)가 만든 스터디 목록
    List<Study> findByLeader(User leader);

    // 모집 중인 스터디 목록 (페이징)
    Page<Study> findByStatusOrderByCreatedAtDesc(StudyStatus status, Pageable pageable);

    // 제목으로 검색 (페이징)
    Page<Study> findByTitleContaining(String keyword, Pageable pageable);

    // 제목 또는 설명으로 검색 (페이징) - 기존 유지
    @Query("SELECT s FROM Study s WHERE s.title LIKE %:keyword% OR s.description LIKE %:keyword%")
    Page<Study> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // 지역별 스터디 조회
    Page<Study> findByRegionContaining(String region, Pageable pageable);

    // 온라인 스터디만 조회
    Page<Study> findByOnlineTrue(Pageable pageable);

    // 특정 리더의 스터디 개수
    long countByLeader(User leader);
}
