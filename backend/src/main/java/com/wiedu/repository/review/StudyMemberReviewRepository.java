package com.wiedu.repository.review;

import com.wiedu.domain.entity.Study;
import com.wiedu.domain.entity.StudyMemberReview;
import com.wiedu.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * 스터디원 간 리뷰 Repository
 */
public interface StudyMemberReviewRepository extends JpaRepository<StudyMemberReview, Long> {

    // 특정 사용자가 받은 리뷰 목록 (N+1 방지)
    @Query("SELECT r FROM StudyMemberReview r JOIN FETCH r.reviewer JOIN FETCH r.study WHERE r.reviewee = :reviewee ORDER BY r.createdAt DESC")
    List<StudyMemberReview> findByRevieweeWithDetails(@Param("reviewee") User reviewee);

    // 특정 사용자가 받은 리뷰 개수
    long countByReviewee(User reviewee);

    // 특정 사용자의 평균 평점
    @Query("SELECT AVG(r.rating) FROM StudyMemberReview r WHERE r.reviewee.id = :revieweeId")
    Double averageRatingByReviewee(@Param("revieweeId") Long revieweeId);

    // 중복 리뷰 방지 (한 스터디 내에서 동일 대상에게 한 번만)
    boolean existsByReviewerAndRevieweeAndStudy(User reviewer, User reviewee, Study study);

    // 특정 스터디의 모든 멤버 리뷰
    @Query("SELECT r FROM StudyMemberReview r JOIN FETCH r.reviewer JOIN FETCH r.reviewee WHERE r.study = :study ORDER BY r.createdAt DESC")
    List<StudyMemberReview> findByStudyWithDetails(@Param("study") Study study);

    // 특정 스터디에서 특정 작성자가 작성한 리뷰 목록
    List<StudyMemberReview> findByStudyAndReviewer(Study study, User reviewer);

    // 특정 스터디에서 리뷰 대상자 목록 (이미 리뷰한 사람 확인용)
    @Query("SELECT r.reviewee.id FROM StudyMemberReview r WHERE r.study = :study AND r.reviewer = :reviewer")
    List<Long> findReviewedMemberIds(@Param("study") Study study, @Param("reviewer") User reviewer);

    // 특정 스터디에서 특정 작성자가 작성한 리뷰 수
    long countByReviewerAndStudy(User reviewer, Study study);

    /**
     * 사용자 삭제 시 리뷰어를 NULL로 설정 (알 수 없음 처리)
     */
    @Modifying
    @Query("UPDATE StudyMemberReview r SET r.reviewer = null WHERE r.reviewer.id = :userId")
    void setReviewerToNull(@Param("userId") Long userId);
}
