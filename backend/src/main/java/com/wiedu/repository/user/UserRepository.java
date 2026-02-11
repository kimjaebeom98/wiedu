package com.wiedu.repository.user;

import com.wiedu.domain.entity.User;
import com.wiedu.domain.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;

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

    // 상태별 사용자 조회
    java.util.List<User> findByStatus(UserStatus status);

    // OAuth 제공자와 ID로 사용자 조회
    Optional<User> findByOauthProviderAndOauthProviderId(String oauthProvider, String oauthProviderId);
}
