package com.wiedu.service.user;

import com.wiedu.domain.entity.User;
import com.wiedu.domain.enums.BadgeType;
import com.wiedu.domain.enums.MemberStatus;
import com.wiedu.domain.enums.StudyStatus;
import com.wiedu.repository.review.StudyMemberReviewRepository;
import com.wiedu.repository.study.StudyMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 뱃지 계산 서비스
 * 우선순위: CHAMPION > POPULAR > KIND > PASSION > NEWBIE
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BadgeService {

    private final StudyMemberRepository studyMemberRepository;
    private final StudyMemberReviewRepository memberReviewRepository;

    // 뱃지 조건 상수
    private static final int CHAMPION_MIN_COMPLETED_STUDIES = 10;
    private static final double POPULAR_MIN_RATING = 4.5;
    private static final int POPULAR_MIN_REVIEWS = 5;
    private static final BigDecimal KIND_MIN_TEMPERATURE = BigDecimal.valueOf(40.0);
    private static final int NEWBIE_DAYS = 7;

    /**
     * 사용자의 대표 뱃지 계산 (우선순위 기반)
     */
    public BadgeType calculateBadge(User user) {
        // 1. CHAMPION: 완료 스터디 10개 이상
        long completedStudies = studyMemberRepository.countCompletedStudiesByUser(
                user, MemberStatus.ACTIVE, StudyStatus.COMPLETED);
        if (completedStudies >= CHAMPION_MIN_COMPLETED_STUDIES) {
            return BadgeType.CHAMPION;
        }

        // 2. POPULAR: 평균 리뷰 4.5점 이상 (최소 5개 리뷰)
        long reviewCount = memberReviewRepository.countByReviewee(user);
        if (reviewCount >= POPULAR_MIN_REVIEWS) {
            Double avgRating = memberReviewRepository.averageRatingByReviewee(user.getId());
            if (avgRating != null && avgRating >= POPULAR_MIN_RATING) {
                return BadgeType.POPULAR;
            }
        }

        // 3. KIND: 매너온도 40도 이상
        if (user.getTemperature().compareTo(KIND_MIN_TEMPERATURE) >= 0) {
            return BadgeType.KIND;
        }

        // 4. PASSION: 연속 7일 로그인 (현재는 단순히 최근 로그인 체크로 대체)
        // TODO: 실제 연속 로그인 추적 로직 필요 시 별도 테이블 필요
        // 현재는 lastLoginAt이 오늘이면 열정 뱃지 (임시 로직)
        if (user.getLastLoginAt() != null &&
            user.getLastLoginAt().isAfter(LocalDateTime.now().minusDays(1))) {
            // PASSION 뱃지는 연속 7일 로그인이 필요하므로 일단 skip
            // 추후 연속 로그인 추적 기능 추가 시 활성화
        }

        // 5. NEWBIE: 가입 7일 이내
        if (user.getCreatedAt() != null &&
            user.getCreatedAt().isAfter(LocalDateTime.now().minusDays(NEWBIE_DAYS))) {
            return BadgeType.NEWBIE;
        }

        // 조건 충족 뱃지 없음
        return null;
    }
}
