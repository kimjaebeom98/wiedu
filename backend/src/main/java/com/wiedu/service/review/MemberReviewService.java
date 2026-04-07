package com.wiedu.service.review;

import com.wiedu.domain.entity.Study;
import com.wiedu.domain.entity.StudyMember;
import com.wiedu.domain.entity.StudyMemberReview;
import com.wiedu.domain.entity.User;
import com.wiedu.domain.enums.MemberStatus;
import com.wiedu.domain.enums.StudyStatus;
import com.wiedu.dto.review.CreateMemberReviewRequest;
import com.wiedu.dto.review.StudyMemberReviewResponse;
import com.wiedu.dto.review.StudyMemberToReviewResponse;
import com.wiedu.exception.BusinessException;
import com.wiedu.exception.ErrorCode;
import com.wiedu.repository.review.StudyMemberReviewRepository;
import com.wiedu.repository.study.StudyMemberRepository;
import com.wiedu.repository.user.UserRepository;
import com.wiedu.service.study.StudyService;
import com.wiedu.service.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberReviewService {

    private final StudyMemberReviewRepository memberReviewRepository;
    private final StudyMemberRepository studyMemberRepository;
    private final UserRepository userRepository;
    private final StudyService studyService;
    private final UserService userService;

    /**
     * 특정 스터디에서 리뷰 대상 멤버 목록 조회
     */
    public List<StudyMemberToReviewResponse> getMembersToReview(Long studyId, Long reviewerId) {
        Study study = studyService.findStudyEntityById(studyId);
        User reviewer = userService.findUserEntityById(reviewerId);

        // 스터디 완료 여부 확인
        if (study.getStatus() != StudyStatus.COMPLETED) {
            throw new BusinessException(ErrorCode.REVIEW_STUDY_NOT_COMPLETED);
        }

        // 리뷰어가 멤버인지 확인
        boolean isMember = studyMemberRepository.existsByStudyAndUserAndStatus(study, reviewer, MemberStatus.ACTIVE);
        if (!isMember) {
            throw new BusinessException(ErrorCode.REVIEW_NOT_MEMBER);
        }

        // 이미 리뷰한 멤버 ID 목록
        List<Long> reviewedMemberIds = memberReviewRepository.findReviewedMemberIds(study, reviewer);

        // 스터디의 모든 멤버 조회 (본인 및 스터디장 제외 - 스터디장은 별도 리뷰 시스템)
        List<StudyMember> members = studyMemberRepository.findByStudyAndStatus(study, MemberStatus.ACTIVE);
        Long leaderId = study.getLeader().getId();

        return members.stream()
            .filter(m -> !m.getUser().getId().equals(reviewerId)) // 본인 제외
            .filter(m -> !m.getUser().getId().equals(leaderId))   // 스터디장 제외
            .map(m -> new StudyMemberToReviewResponse(
                m.getUser().getId(),
                m.getUser().getNickname(),
                m.getUser().getProfileImage(),
                reviewedMemberIds.contains(m.getUser().getId())
            ))
            .toList();
    }

    /**
     * 멤버 리뷰 작성
     */
    @Transactional
    public StudyMemberReviewResponse createMemberReview(Long studyId, Long reviewerId, CreateMemberReviewRequest request) {
        Study study = studyService.findStudyEntityById(studyId);
        User reviewer = userService.findUserEntityById(reviewerId);
        User reviewee = userService.findUserEntityById(request.revieweeId());

        // 스터디 완료 여부 확인
        if (study.getStatus() != StudyStatus.COMPLETED) {
            throw new BusinessException(ErrorCode.REVIEW_STUDY_NOT_COMPLETED);
        }

        // 자기 자신 리뷰 방지
        if (reviewerId.equals(request.revieweeId())) {
            throw new BusinessException(ErrorCode.REVIEW_SELF_NOT_ALLOWED);
        }

        // 리뷰어가 멤버인지 확인
        boolean isReviewerMember = studyMemberRepository.existsByStudyAndUserAndStatus(study, reviewer, MemberStatus.ACTIVE);
        if (!isReviewerMember) {
            throw new BusinessException(ErrorCode.REVIEW_NOT_MEMBER);
        }

        // 리뷰 대상자가 멤버인지 확인
        boolean isRevieweeMember = studyMemberRepository.existsByStudyAndUserAndStatus(study, reviewee, MemberStatus.ACTIVE);
        if (!isRevieweeMember) {
            throw new BusinessException(ErrorCode.REVIEW_TARGET_NOT_MEMBER);
        }

        // 중복 리뷰 방지
        if (memberReviewRepository.existsByReviewerAndRevieweeAndStudy(reviewer, reviewee, study)) {
            throw new BusinessException(ErrorCode.REVIEW_ALREADY_EXISTS);
        }

        // 태그를 콤마 구분 문자열로 변환
        String tagsString = request.tags() != null && !request.tags().isEmpty()
                ? String.join(",", request.tags())
                : null;

        StudyMemberReview review = StudyMemberReview.builder()
            .reviewer(reviewer)
            .reviewee(reviewee)
            .study(study)
            .rating(request.rating())
            .content(request.content())
            .tags(tagsString)
            .build();

        StudyMemberReview saved = memberReviewRepository.save(review);

        // 리뷰 대상자 온도 업데이트 (리뷰 평점 + 태그 보너스)
        int tagCount = request.tags() != null ? request.tags().size() : 0;
        BigDecimal temperatureDelta = calculateTemperatureDelta(request.rating(), tagCount);
        reviewee.updateTemperature(temperatureDelta);
        userRepository.save(reviewee);

        log.info("멤버 리뷰 생성: studyId={}, reviewer={}, reviewee={}, rating={}, tags={}, tempDelta={}",
            studyId, reviewerId, request.revieweeId(), request.rating(), tagCount, temperatureDelta);

        return StudyMemberReviewResponse.from(saved);
    }

    /**
     * 특정 사용자가 받은 멤버 리뷰 목록 조회
     */
    public List<StudyMemberReviewResponse> getMemberReviews(Long userId) {
        User user = userService.findUserEntityById(userId);
        List<StudyMemberReview> reviews = memberReviewRepository.findByRevieweeWithDetails(user);
        return reviews.stream()
            .map(StudyMemberReviewResponse::from)
            .toList();
    }

    /**
     * 내가 작성한 멤버 리뷰 목록 조회
     */
    public List<StudyMemberReviewResponse> getReviewsWrittenByMe(Long reviewerId) {
        User reviewer = userService.findUserEntityById(reviewerId);
        return memberReviewRepository.findByReviewerWithDetails(reviewer).stream()
            .map(StudyMemberReviewResponse::from)
            .toList();
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
