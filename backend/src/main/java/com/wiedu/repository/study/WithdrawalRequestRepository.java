package com.wiedu.repository.study;

import com.wiedu.domain.entity.Study;
import com.wiedu.domain.entity.User;
import com.wiedu.domain.entity.WithdrawalRequest;
import com.wiedu.domain.enums.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * 스터디 탈퇴 신청 Repository
 */
public interface WithdrawalRequestRepository extends JpaRepository<WithdrawalRequest, Long> {

    // 특정 스터디의 탈퇴 신청 목록
    List<WithdrawalRequest> findByStudy(Study study);

    // 특정 스터디의 상태별 탈퇴 신청 목록
    List<WithdrawalRequest> findByStudyAndStatus(Study study, RequestStatus status);

    // 특정 스터디의 대기 중인 탈퇴 신청 목록 (페이징)
    Page<WithdrawalRequest> findByStudyAndStatus(Study study, RequestStatus status, Pageable pageable);

    // 특정 사용자의 탈퇴 신청 목록
    List<WithdrawalRequest> findByUser(User user);

    // 특정 스터디 + 사용자의 탈퇴 신청 조회 (상태별)
    Optional<WithdrawalRequest> findByStudyAndUserAndStatus(Study study, User user, RequestStatus status);

    // 해당 스터디에 대기 중인 탈퇴 신청이 있는지 확인
    boolean existsByStudyAndUserAndStatus(Study study, User user, RequestStatus status);

    // 특정 스터디의 대기 중인 탈퇴 신청 수
    long countByStudyAndStatus(Study study, RequestStatus status);
}
