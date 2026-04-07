package com.wiedu.service.review;

import com.wiedu.domain.entity.Study;
import com.wiedu.domain.entity.StudyLeaderReview;
import com.wiedu.domain.entity.User;
import com.wiedu.domain.enums.MemberStatus;
import com.wiedu.domain.enums.StudyStatus;

import java.math.BigDecimal;
import com.wiedu.dto.review.CreateReviewRequest;
import com.wiedu.dto.review.StudyLeaderReviewResponse;
import com.wiedu.dto.review.StudyLeaderReviewsResponse;
import com.wiedu.exception.BusinessException;
import com.wiedu.exception.ErrorCode;
import com.wiedu.repository.review.StudyLeaderReviewRepository;
import com.wiedu.repository.study.StudyMemberRepository;
import com.wiedu.repository.user.UserRepository;
import com.wiedu.service.study.StudyService;
import com.wiedu.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final StudyLeaderReviewRepository reviewRepository;
    private final StudyMemberRepository studyMemberRepository;
    private final UserRepository userRepository;
    private final StudyService studyService;
    private final UserService userService;

    /**
     * 스터디장이 받은 리뷰 목록 조회
     */
    public StudyLeaderReviewsResponse getLeaderReviews(Long leaderId) {
        User leader = userService.findUserEntityById(leaderId);

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
        Study study = studyService.findStudyEntityById(studyId);
        User reviewer = userService.findUserEntityById(reviewerId);

        // 스터디 완료 여부 확인
        if (study.getStatus() != StudyStatus.COMPLETED) {
            throw new BusinessException(ErrorCode.REVIEW_STUDY_NOT_COMPLETED);
        }

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

        // 스터디장 본인은 자기 리뷰 불가
        if (reviewerId.equals(leader.getId())) {
            throw new BusinessException(ErrorCode.REVIEW_SELF_NOT_ALLOWED);
        }

        // 태그를 콤마 구분 문자열로 변환
        String tagsString = request.tags() != null && !request.tags().isEmpty()
                ? String.join(",", request.tags())
                : null;

        StudyLeaderReview review = StudyLeaderReview.builder()
                .reviewer(reviewer)
                .leader(leader)
                .study(study)
                .rating(request.rating())
                .content(request.content())
                .tags(tagsString)
                .build();

        StudyLeaderReview saved = reviewRepository.save(review);

        // 스터디장 온도 업데이트 (리뷰 평점 + 태그 보너스)
        int tagCount = request.tags() != null ? request.tags().size() : 0;
        BigDecimal temperatureDelta = calculateTemperatureDelta(request.rating(), tagCount);
        leader.updateTemperature(temperatureDelta);
        userRepository.save(leader);

        return StudyLeaderReviewResponse.from(saved);
    }

    /**
     * 사용자가 해당 스터디에 리뷰를 작성했는지 확인
     */
    public boolean hasUserReviewedStudy(Long studyId, Long userId) {
        Study study = studyService.findStudyEntityById(studyId);
        User user = userService.findUserEntityById(userId);
        return reviewRepository.existsByReviewerAndStudy(user, study);
    }

    /**
     * 리뷰 평점 및 태그에 따른 온도 변화량 계산
     * 기본: 5점(+0.3), 4점(+0.2), 3점(+0.1), 2점(-0.1), 1점(-0.2)
     * 태그 보너스: 긍정 태그 1개당 +0.02 (최대 6개 = +0.12)
     */
    private BigDecimal calculateTemperatureDelta(int rating, int tagCount) {
        BigDecimal baseDelta = switch (rating) {
            case 5 -> BigDecimal.valueOf(0.3);
            case 4 -> BigDecimal.valueOf(0.2);
            case 3 -> BigDecimal.valueOf(0.1);
            case 2 -> BigDecimal.valueOf(-0.1);
            case 1 -> BigDecimal.valueOf(-0.2);
            default -> BigDecimal.ZERO;
        };

        // 태그 보너스 (긍정적 리뷰일 때만, 3점 이상)
        if (rating >= 3 && tagCount > 0) {
            BigDecimal tagBonus = BigDecimal.valueOf(0.02).multiply(BigDecimal.valueOf(tagCount));
            return baseDelta.add(tagBonus);
        }

        return baseDelta;
    }

}
