package com.wiedu.service.review;

import com.wiedu.domain.entity.Study;
import com.wiedu.domain.entity.StudyLeaderReview;
import com.wiedu.domain.entity.User;
import com.wiedu.domain.enums.MemberStatus;
import com.wiedu.dto.review.CreateReviewRequest;
import com.wiedu.dto.review.StudyLeaderReviewResponse;
import com.wiedu.dto.review.StudyLeaderReviewsResponse;
import com.wiedu.exception.BusinessException;
import com.wiedu.exception.ErrorCode;
import com.wiedu.repository.review.StudyLeaderReviewRepository;
import com.wiedu.repository.study.StudyMemberRepository;
import com.wiedu.repository.study.StudyRepository;
import com.wiedu.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final StudyLeaderReviewRepository reviewRepository;
    private final StudyRepository studyRepository;
    private final StudyMemberRepository studyMemberRepository;
    private final UserRepository userRepository;

    /**
     * 스터디장이 받은 리뷰 목록 조회
     */
    public StudyLeaderReviewsResponse getLeaderReviews(Long leaderId) {
        User leader = findUserById(leaderId);

        List<StudyLeaderReview> reviews = reviewRepository.findByLeaderWithDetails(leader);
        List<StudyLeaderReviewResponse> reviewResponses = reviews.stream()
                .map(StudyLeaderReviewResponse::from)
                .toList();

        Double averageRating = reviewRepository.averageRatingByLeader(leaderId);
        long totalCount = reviewRepository.countByLeader(leader);

        return new StudyLeaderReviewsResponse(reviewResponses, averageRating, totalCount);
    }

    /**
     * 스터디장 리뷰 작성
     */
    @Transactional
    public StudyLeaderReviewResponse createReview(Long studyId, Long reviewerId, CreateReviewRequest request) {
        Study study = findStudyById(studyId);
        User reviewer = findUserById(reviewerId);

        // 스터디 멤버 여부 확인
        boolean isMember = studyMemberRepository.existsByStudyAndUserAndStatus(study, reviewer, MemberStatus.ACTIVE);
        if (!isMember) {
            throw new BusinessException(ErrorCode.REVIEW_NOT_MEMBER);
        }

        // 중복 리뷰 방지
        if (reviewRepository.existsByReviewerAndStudy(reviewer, study)) {
            throw new BusinessException(ErrorCode.REVIEW_ALREADY_EXISTS);
        }

        User leader = study.getLeader();

        StudyLeaderReview review = StudyLeaderReview.builder()
                .reviewer(reviewer)
                .leader(leader)
                .study(study)
                .rating(request.rating())
                .content(request.content())
                .build();

        StudyLeaderReview saved = reviewRepository.save(review);
        return StudyLeaderReviewResponse.from(saved);
    }

    // === Helper Methods ===

    private Study findStudyById(Long studyId) {
        return studyRepository.findById(studyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));
    }

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }
}
