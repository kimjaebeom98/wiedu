package com.wiedu.repository.review;

import com.wiedu.domain.entity.Study;
import com.wiedu.domain.entity.StudyLeaderReview;
import com.wiedu.domain.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * 스터디장 리뷰 Repository
 */
public interface StudyLeaderReviewRepository extends JpaRepository<StudyLeaderReview, Long> {

    // 스터디장이 받은 리뷰 목록
    List<StudyLeaderReview> findByLeader(User leader);

    // 스터디장이 받은 리뷰 목록 (N+1 방지, JOIN FETCH)
    @Query("SELECT r FROM StudyLeaderReview r JOIN FETCH r.reviewer JOIN FETCH r.study WHERE r.leader = :leader ORDER BY r.createdAt DESC")
    List<StudyLeaderReview> findByLeaderWithDetails(@Param("leader") User leader);

    // 스터디장이 받은 리뷰 목록 (페이징, 최신순)
    Page<StudyLeaderReview> findByLeaderOrderByCreatedAtDesc(User leader, Pageable pageable);

    // 스터디장이 받은 리뷰 개수
    long countByLeader(User leader);

    // 스터디장의 평균 평점
    @Query("SELECT AVG(r.rating) FROM StudyLeaderReview r WHERE r.leader.id = :leaderId")
    Double averageRatingByLeader(@Param("leaderId") Long leaderId);

    // 중복 리뷰 방지 (한 스터디당 한 번만)
    boolean existsByReviewerAndStudy(User reviewer, Study study);
}
