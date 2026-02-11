package com.wiedu.repository.study;

import com.wiedu.domain.entity.Study;
import com.wiedu.domain.entity.StudyRequest;
import com.wiedu.domain.entity.User;
import com.wiedu.domain.enums.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * 스터디 가입 신청 Repository
 */
public interface StudyRequestRepository extends JpaRepository<StudyRequest, Long> {

    // 특정 스터디의 신청 목록
    List<StudyRequest> findByStudy(Study study);

    // 특정 스터디의 상태별 신청 목록
    List<StudyRequest> findByStudyAndStatus(Study study, RequestStatus status);

    // 특정 스터디의 대기 중인 신청 목록 (페이징)
    Page<StudyRequest> findByStudyAndStatus(Study study, RequestStatus status, Pageable pageable);

    // 특정 사용자의 신청 목록
    List<StudyRequest> findByUser(User user);

    // 특정 사용자의 상태별 신청 목록
    List<StudyRequest> findByUserAndStatus(User user, RequestStatus status);

    // 특정 스터디 + 사용자의 신청 조회
    Optional<StudyRequest> findByStudyAndUser(Study study, User user);

    // 해당 스터디에 이미 신청했는지 확인
    boolean existsByStudyAndUser(Study study, User user);

    // 해당 스터디에 대기 중인 신청이 있는지 확인
    boolean existsByStudyAndUserAndStatus(Study study, User user, RequestStatus status);

    // 특정 스터디의 대기 중인 신청 수
    long countByStudyAndStatus(Study study, RequestStatus status);

    // 특정 사용자의 대기 중인 신청 수
    long countByUserAndStatus(User user, RequestStatus status);
}
