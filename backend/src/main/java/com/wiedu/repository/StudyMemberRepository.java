package com.wiedu.repository;

import com.wiedu.domain.entity.Study;
import com.wiedu.domain.entity.StudyMember;
import com.wiedu.domain.entity.User;
import com.wiedu.domain.enums.MemberRole;
import com.wiedu.domain.enums.MemberStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * 스터디 멤버 Repository
 */
public interface StudyMemberRepository extends JpaRepository<StudyMember, Long> {

    // 특정 스터디의 멤버 목록
    List<StudyMember> findByStudy(Study study);

    // 특정 스터디의 활성 멤버 목록
    List<StudyMember> findByStudyAndStatus(Study study, MemberStatus status);

    // 특정 사용자가 가입한 스터디 멤버십 목록
    List<StudyMember> findByUser(User user);

    // 특정 사용자의 활성 멤버십 목록
    List<StudyMember> findByUserAndStatus(User user, MemberStatus status);

    // 특정 스터디 + 사용자의 멤버십 조회
    Optional<StudyMember> findByStudyAndUser(Study study, User user);

    // 특정 스터디의 리더 조회
    Optional<StudyMember> findByStudyAndRole(Study study, MemberRole role);

    // 해당 스터디에 이미 가입했는지 확인
    boolean existsByStudyAndUser(Study study, User user);

    // 해당 스터디에 활성 멤버로 가입했는지 확인
    boolean existsByStudyAndUserAndStatus(Study study, User user, MemberStatus status);

    // 특정 스터디의 활성 멤버 수
    long countByStudyAndStatus(Study study, MemberStatus status);

    // 사용자가 리더인 스터디 목록 조회
    @Query("SELECT sm.study FROM StudyMember sm WHERE sm.user = :user AND sm.role = :role AND sm.status = :status")
    List<Study> findStudiesByUserAndRole(@Param("user") User user, @Param("role") MemberRole role,
            @Param("status") MemberStatus status);
}
