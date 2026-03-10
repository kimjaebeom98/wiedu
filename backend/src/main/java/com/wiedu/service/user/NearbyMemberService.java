package com.wiedu.service.user;

import com.wiedu.domain.entity.User;
import com.wiedu.domain.enums.BadgeType;
import com.wiedu.dto.user.NearbyMemberResponse;
import com.wiedu.exception.BusinessException;
import com.wiedu.exception.ErrorCode;
import com.wiedu.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

/**
 * 근처 활동중인 멤버 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NearbyMemberService {

    private final UserRepository userRepository;
    private final BadgeService badgeService;

    // 기본값
    private static final double DEFAULT_RADIUS_KM = 10.0;
    private static final int ACTIVE_DAYS = 3;  // 3일 이내 로그인 = 활동중
    private static final int DEFAULT_LIMIT = 10;

    /**
     * 근처 활동중인 멤버 조회
     *
     * @param userId 현재 사용자 ID (본인 제외용)
     * @param latitude 현재 위치 위도
     * @param longitude 현재 위치 경도
     * @param radiusKm 검색 반경 (km), null이면 기본값 10km
     * @param limit 최대 조회 수, null이면 기본값 10
     * @return 근처 활동중인 멤버 목록 (뱃지 포함)
     */
    public List<NearbyMemberResponse> findNearbyActiveMembers(
            Long userId,
            Double latitude,
            Double longitude,
            Double radiusKm,
            Integer limit) {

        // 위치 정보 없으면 빈 목록 반환
        if (latitude == null || longitude == null) {
            log.debug("위치 정보 없음 - 근처 멤버 조회 불가");
            return Collections.emptyList();
        }

        double radius = radiusKm != null ? radiusKm : DEFAULT_RADIUS_KM;
        int limitCount = limit != null ? limit : DEFAULT_LIMIT;
        LocalDateTime activeThreshold = LocalDateTime.now().minusDays(ACTIVE_DAYS);

        // 근처 활동중인 사용자 조회
        List<User> nearbyUsers = userRepository.findNearbyActiveUsers(
                latitude,
                longitude,
                radius,
                activeThreshold,
                userId,
                limitCount
        );

        log.debug("근처 활동중인 멤버 조회: lat={}, lng={}, radius={}km, found={}",
                latitude, longitude, radius, nearbyUsers.size());

        // 뱃지 계산 후 DTO 변환
        return nearbyUsers.stream()
                .map(user -> {
                    BadgeType badge = badgeService.calculateBadge(user);
                    return NearbyMemberResponse.from(user, badge);
                })
                .toList();
    }

    /**
     * 현재 로그인한 사용자 기준 근처 활동중인 멤버 조회
     */
    public List<NearbyMemberResponse> findNearbyActiveMembersForCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        return findNearbyActiveMembers(
                userId,
                user.getLatitude(),
                user.getLongitude(),
                DEFAULT_RADIUS_KM,
                DEFAULT_LIMIT
        );
    }
}
