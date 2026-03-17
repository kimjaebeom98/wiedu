package com.wiedu.repository.study;

import com.wiedu.domain.entity.Study;
import com.wiedu.domain.entity.StudyMember;
import com.wiedu.domain.entity.User;
import com.wiedu.domain.enums.MemberRole;
import com.wiedu.domain.enums.MemberStatus;
import com.wiedu.domain.enums.StudyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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

    // 특정 스터디의 활성 멤버 목록 (User 포함, N+1 방지)
    @Query("SELECT sm FROM StudyMember sm JOIN FETCH sm.user WHERE sm.study = :study AND sm.status = :status")
    List<StudyMember> findByStudyAndStatusWithUser(@Param("study") Study study, @Param("status") MemberStatus status);

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

    // 사용자가 완료한 스터디 개수 (뱃지 계산용)
    @Query("SELECT COUNT(sm) FROM StudyMember sm WHERE sm.user = :user AND sm.status = :memberStatus AND sm.study.status = :studyStatus")
    long countCompletedStudiesByUser(@Param("user") User user,
            @Param("memberStatus") MemberStatus memberStatus,
            @Param("studyStatus") StudyStatus studyStatus);

    // 스터디 ID로 활성 멤버 수 조회
    @Query("SELECT COUNT(sm) FROM StudyMember sm WHERE sm.study.id = :studyId AND sm.status = :status")
    int countByStudyIdAndStatus(@Param("studyId") Long studyId, @Param("status") MemberStatus status);

    // 스터디 ID로 멤버 목록 조회
    @Query("SELECT sm FROM StudyMember sm WHERE sm.study.id = :studyId AND sm.status = :status")
    List<StudyMember> findByStudyIdAndStatus(@Param("studyId") Long studyId, @Param("status") MemberStatus status);

    // 스터디 ID + 사용자 ID로 멤버 여부 확인
    @Query("SELECT CASE WHEN COUNT(sm) > 0 THEN true ELSE false END FROM StudyMember sm WHERE sm.study.id = :studyId AND sm.user.id = :userId AND sm.status = :status")
    boolean existsByStudyIdAndUserIdAndStatus(@Param("studyId") Long studyId, @Param("userId") Long userId, @Param("status") MemberStatus status);

    /**
     * 사용자 삭제 시 해당 사용자의 모든 멤버십 삭제
     */
    @Modifying
    @Query("DELETE FROM StudyMember sm WHERE sm.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
