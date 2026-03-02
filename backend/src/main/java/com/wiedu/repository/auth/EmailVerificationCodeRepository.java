package com.wiedu.repository.auth;

import com.wiedu.domain.entity.EmailVerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface EmailVerificationCodeRepository extends JpaRepository<EmailVerificationCode, Long> {

    /**
     * 이메일로 가장 최근 인증 코드 조회 (만료되지 않고 미인증인 것)
     */
    @Query("SELECT e FROM EmailVerificationCode e WHERE e.email = :email AND e.verified = false AND e.expiresAt > :now ORDER BY e.createdAt DESC LIMIT 1")
    Optional<EmailVerificationCode> findLatestValidCode(@Param("email") String email, @Param("now") LocalDateTime now);

    /**
     * 이메일로 인증 완료된 코드 조회
     */
    Optional<EmailVerificationCode> findByEmailAndVerifiedTrue(String email);

    /**
     * 만료된 코드 삭제
     */
    @Modifying
    @Query("DELETE FROM EmailVerificationCode e WHERE e.expiresAt < :now")
    void deleteExpiredCodes(@Param("now") LocalDateTime now);

    /**
     * 이메일의 모든 미인증 코드 삭제 (새 코드 발급 전)
     */
    @Modifying
    @Query("DELETE FROM EmailVerificationCode e WHERE e.email = :email AND e.verified = false")
    void deleteUnverifiedByEmail(@Param("email") String email);
}
