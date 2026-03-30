package com.wiedu.repository.study;

import com.wiedu.domain.entity.Study;
import com.wiedu.domain.entity.User;
import com.wiedu.domain.enums.StudyStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * 스터디 Repository
 */
public interface StudyRepository extends JpaRepository<Study, Long> {

    // ID로 조회 (전체 상세 포함)
    @Query("SELECT DISTINCT s FROM Study s " +
           "JOIN FETCH s.leader " +
           "JOIN FETCH s.category " +
           "LEFT JOIN FETCH s.subcategory " +
           "WHERE s.id = :id")
    Optional<Study> findByIdWithDetails(@Param("id") Long id);

    // ID로 조회 (리더 포함)
    @Query("SELECT s FROM Study s JOIN FETCH s.leader WHERE s.id = :id")
    Optional<Study> findByIdWithLeader(@Param("id") Long id);

    // 전체 목록 (리더, 카테고리 포함, 페이징)
    @Query(value = "SELECT s FROM Study s JOIN FETCH s.leader JOIN FETCH s.category",
           countQuery = "SELECT COUNT(s) FROM Study s")
    Page<Study> findAllWithLeader(Pageable pageable);

    // 상태별 스터디 목록 (리더, 카테고리 포함, 페이징)
    @Query(value = "SELECT s FROM Study s JOIN FETCH s.leader JOIN FETCH s.category WHERE s.status = :status",
           countQuery = "SELECT COUNT(s) FROM Study s WHERE s.status = :status")
    Page<Study> findByStatusWithLeader(@Param("status") StudyStatus status, Pageable pageable);

    // 카테고리별 스터디 목록 (리더, 카테고리 포함, 페이징)
    @Query(value = "SELECT s FROM Study s JOIN FETCH s.leader JOIN FETCH s.category WHERE s.category.id = :categoryId",
           countQuery = "SELECT COUNT(s) FROM Study s WHERE s.category.id = :categoryId")
    Page<Study> findByCategoryIdWithLeader(@Param("categoryId") Long categoryId, Pageable pageable);

    // 카테고리 + 서브카테고리별 스터디 목록 (리더, 카테고리 포함, 페이징)
    @Query(value = "SELECT s FROM Study s JOIN FETCH s.leader JOIN FETCH s.category WHERE s.category.id = :categoryId AND s.subcategory.id = :subcategoryId",
           countQuery = "SELECT COUNT(s) FROM Study s WHERE s.category.id = :categoryId AND s.subcategory.id = :subcategoryId")
    Page<Study> findByCategoryIdAndSubcategoryIdWithLeader(@Param("categoryId") Long categoryId, @Param("subcategoryId") Long subcategoryId, Pageable pageable);

    // 제목 또는 설명으로 검색 (리더, 카테고리 포함, 페이징)
    @Query(value = "SELECT s FROM Study s JOIN FETCH s.leader JOIN FETCH s.category WHERE s.title LIKE %:keyword% OR s.description LIKE %:keyword%",
           countQuery = "SELECT COUNT(s) FROM Study s WHERE s.title LIKE %:keyword% OR s.description LIKE %:keyword%")
    Page<Study> searchByKeywordWithLeader(@Param("keyword") String keyword, Pageable pageable);

    // 상태별 스터디 목록 (페이징) - 기존 유지
    Page<Study> findByStatus(StudyStatus status, Pageable pageable);

    // 카테고리별 스터디 목록 (페이징)
    @Query("SELECT s FROM Study s WHERE s.category.id = :categoryId")
    Page<Study> findByCategoryId(@Param("categoryId") Long categoryId, Pageable pageable);

    // 카테고리 + 상태로 조회 (페이징)
    @Query("SELECT s FROM Study s WHERE s.category.id = :categoryId AND s.status = :status")
    Page<Study> findByCategoryIdAndStatus(@Param("categoryId") Long categoryId, @Param("status") StudyStatus status, Pageable pageable);

    // 리더(스터디장)가 만든 스터디 목록
    List<Study> findByLeader(User leader);

    // 모집 중인 스터디 목록 (페이징)
    Page<Study> findByStatusOrderByCreatedAtDesc(StudyStatus status, Pageable pageable);

    // 제목으로 검색 (페이징)
    Page<Study> findByTitleContaining(String keyword, Pageable pageable);

    // 제목 또는 설명으로 검색 (페이징) - 기존 유지
    @Query("SELECT s FROM Study s WHERE s.title LIKE %:keyword% OR s.description LIKE %:keyword%")
    Page<Study> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // 특정 리더의 스터디 개수
    long countByLeader(User leader);

    // 인기 스터디 (충원율 높은 순, 모집중인 스터디만)
    @Query(value = "SELECT s FROM Study s JOIN FETCH s.leader JOIN FETCH s.category " +
            "WHERE s.status = 'RECRUITING' " +
            "ORDER BY (s.currentMembers * 1.0 / NULLIF(s.maxMembers, 0)) DESC, s.currentMembers DESC")
    List<Study> findPopularStudies(Pageable pageable);

    // 인기 스터디 페이지네이션 (충원율 높은 순, 모집중인 스터디만)
    @Query(value = "SELECT s FROM Study s JOIN FETCH s.leader JOIN FETCH s.category " +
            "WHERE s.status = 'RECRUITING' " +
            "ORDER BY (s.currentMembers * 1.0 / NULLIF(s.maxMembers, 0)) DESC, s.currentMembers DESC",
            countQuery = "SELECT COUNT(s) FROM Study s WHERE s.status = 'RECRUITING'")
    Page<Study> findPopularStudiesPaginated(Pageable pageable);

    // 최신 스터디 (모집중, 생성일 기준 최신순) - 인기 스터디 fallback용
    @Query(value = "SELECT s FROM Study s JOIN FETCH s.leader JOIN FETCH s.category " +
            "WHERE s.status = 'RECRUITING' " +
            "ORDER BY s.createdAt DESC")
    List<Study> findRecentRecruitingStudies(Pageable pageable);

    // 모집중인 전체 스터디 (생성일 기준 최신순) - 근처 스터디 fallback용
    @Query(value = "SELECT s FROM Study s JOIN FETCH s.leader JOIN FETCH s.category " +
            "WHERE s.status = 'RECRUITING' " +
            "ORDER BY s.createdAt DESC")
    List<Study> findAllRecruitingStudies(Pageable pageable);

    // ID 목록으로 스터디 조회 (리더, 카테고리 포함 - N+1 방지)
    @Query("SELECT s FROM Study s JOIN FETCH s.leader JOIN FETCH s.category WHERE s.id IN :ids")
    List<Study> findByIdsWithLeaderAndCategory(@Param("ids") List<Long> ids);

    // 근처 스터디 검색 (Haversine 공식, OFFLINE/HYBRID RECRUITING 상태만)
    @Query(value = "SELECT s.* FROM studies s " +
            "WHERE s.meeting_latitude IS NOT NULL " +
            "AND s.meeting_longitude IS NOT NULL " +
            "AND s.status = 'RECRUITING' " +
            "AND s.study_method IN ('OFFLINE', 'HYBRID') " +
            "AND (6371 * acos(LEAST(1.0, GREATEST(-1.0, " +
            "cos(radians(:lat)) * cos(radians(s.meeting_latitude)) * " +
            "cos(radians(s.meeting_longitude) - radians(:lng)) + " +
            "sin(radians(:lat)) * sin(radians(s.meeting_latitude)))))) < :radius " +
            "ORDER BY (6371 * acos(LEAST(1.0, GREATEST(-1.0, " +
            "cos(radians(:lat)) * cos(radians(s.meeting_latitude)) * " +
            "cos(radians(s.meeting_longitude) - radians(:lng)) + " +
            "sin(radians(:lat)) * sin(radians(s.meeting_latitude))))))", nativeQuery = true)
    List<Study> findNearbyStudies(@Param("lat") Double lat, @Param("lng") Double lng, @Param("radius") Double radiusKm);

    // 근처 스터디 검색 페이지네이션 (Haversine 공식)
    @Query(value = "SELECT s.* FROM studies s " +
            "WHERE s.meeting_latitude IS NOT NULL " +
            "AND s.meeting_longitude IS NOT NULL " +
            "AND s.status = 'RECRUITING' " +
            "AND s.study_method IN ('OFFLINE', 'HYBRID') " +
            "AND (6371 * acos(LEAST(1.0, GREATEST(-1.0, " +
            "cos(radians(:lat)) * cos(radians(s.meeting_latitude)) * " +
            "cos(radians(s.meeting_longitude) - radians(:lng)) + " +
            "sin(radians(:lat)) * sin(radians(s.meeting_latitude)))))) < :radius " +
            "ORDER BY (6371 * acos(LEAST(1.0, GREATEST(-1.0, " +
            "cos(radians(:lat)) * cos(radians(s.meeting_latitude)) * " +
            "cos(radians(s.meeting_longitude) - radians(:lng)) + " +
            "sin(radians(:lat)) * sin(radians(s.meeting_latitude))))))",
            countQuery = "SELECT COUNT(*) FROM studies s " +
            "WHERE s.meeting_latitude IS NOT NULL " +
            "AND s.meeting_longitude IS NOT NULL " +
            "AND s.status = 'RECRUITING' " +
            "AND s.study_method IN ('OFFLINE', 'HYBRID') " +
            "AND (6371 * acos(LEAST(1.0, GREATEST(-1.0, " +
            "cos(radians(:lat)) * cos(radians(s.meeting_latitude)) * " +
            "cos(radians(s.meeting_longitude) - radians(:lng)) + " +
            "sin(radians(:lat)) * sin(radians(s.meeting_latitude)))))) < :radius",
            nativeQuery = true)
    Page<Study> findNearbyStudiesPaginated(@Param("lat") Double lat, @Param("lng") Double lng, @Param("radius") Double radiusKm, Pageable pageable);

    /**
     * 특정 사용자가 리더인 스터디가 있는지 확인
     */
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM Study s WHERE s.leader.id = :leaderId")
    boolean existsByLeaderId(@Param("leaderId") Long leaderId);

    /**
     * 멤버 수 atomic 증가 (Lost Update 방지)
     * 정원 초과 방지: maxMembers 미만일 때만 증가
     * 정원 도달 시 자동으로 RECRUITING → IN_PROGRESS 상태 전이
     * @return 업데이트된 행 수 (1이면 성공, 0이면 정원 초과)
     */
    @Modifying
    @Query("UPDATE Study s SET s.currentMembers = s.currentMembers + 1, " +
           "s.status = CASE WHEN s.currentMembers + 1 >= s.maxMembers AND s.status = 'RECRUITING' " +
           "THEN 'IN_PROGRESS' ELSE s.status END " +
           "WHERE s.id = :id AND s.currentMembers < s.maxMembers")
    int incrementMemberCount(@Param("id") Long id);

    /**
     * 멤버 수 atomic 감소 (Lost Update 방지)
     * 1 미만으로 내려가지 않음 (스터디장은 항상 존재)
     */
    @Modifying
    @Query("UPDATE Study s SET s.currentMembers = CASE WHEN s.currentMembers > 1 THEN s.currentMembers - 1 ELSE 1 END WHERE s.id = :id")
    void decrementMemberCount(@Param("id") Long id);
}
