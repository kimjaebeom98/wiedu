package com.wiedu.repository.user;

import com.wiedu.domain.entity.User;
import com.wiedu.domain.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 사용자 Repository
 */
public interface UserRepository extends JpaRepository<User, Long> {

    // 이메일로 사용자 조회 (로그인, 중복 체크)
    Optional<User> findByEmail(String email);

    // 닉네임으로 사용자 조회 (중복 체크)
    Optional<User> findByNickname(String nickname);

    // 이메일 존재 여부 확인
    boolean existsByEmail(String email);

    // 닉네임 존재 여부 확인
    boolean existsByNickname(String nickname);

    // 닉네임 존재 여부 확인 (특정 사용자 제외)
    boolean existsByNicknameAndIdNot(String nickname, Long id);

    // 상태별 사용자 조회
    java.util.List<User> findByStatus(UserStatus status);

    // OAuth 제공자와 ID로 사용자 조회
    Optional<User> findByOauthProviderAndOauthProviderId(String oauthProvider, String oauthProviderId);

    /**
     * 근처 활동중인 멤버 조회 (Haversine 공식)
     * - 활동중: lastLoginAt이 activeThreshold 이후
     * - 근처: 반경 radiusKm 이내
     * - 본인 제외
     */
    @Query(value = "SELECT u.* FROM users u " +
            "WHERE u.latitude IS NOT NULL " +
            "AND u.longitude IS NOT NULL " +
            "AND u.status = 'ACTIVE' " +
            "AND u.last_login_at > :activeThreshold " +
            "AND u.id != :excludeUserId " +
            "AND (6371 * acos(LEAST(1.0, GREATEST(-1.0, " +
            "cos(radians(:lat)) * cos(radians(u.latitude)) * " +
            "cos(radians(u.longitude) - radians(:lng)) + " +
            "sin(radians(:lat)) * sin(radians(u.latitude)))))) < :radius " +
            "ORDER BY u.last_login_at DESC " +
            "LIMIT :limitCount", nativeQuery = true)
    List<User> findNearbyActiveUsers(
            @Param("lat") Double lat,
            @Param("lng") Double lng,
            @Param("radius") Double radiusKm,
            @Param("activeThreshold") LocalDateTime activeThreshold,
            @Param("excludeUserId") Long excludeUserId,
            @Param("limitCount") int limitCount);
}
