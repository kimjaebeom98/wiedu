package com.wiedu.repository.study;

import com.wiedu.domain.entity.CurriculumSession;
import com.wiedu.domain.entity.SessionAttendance;
import com.wiedu.domain.enums.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SessionAttendanceRepository extends JpaRepository<SessionAttendance, Long> {

    /**
     * 특정 회차의 모든 참석 정보 조회
     */
    List<SessionAttendance> findBySessionIdOrderByRespondedAtDesc(Long sessionId);

    /**
     * 특정 회차에 대한 사용자의 참석 정보 조회
     */
    Optional<SessionAttendance> findBySessionIdAndUserId(Long sessionId, Long userId);

    /**
     * 특정 회차의 참석 상태별 카운트
     */
    @Query("SELECT COUNT(a) FROM SessionAttendance a WHERE a.session.id = :sessionId AND a.status = :status")
    int countBySessionIdAndStatus(Long sessionId, AttendanceStatus status);

    /**
     * 특정 스터디의 승인 대기 중인 불참 신청 목록
     */
    @Query("SELECT a FROM SessionAttendance a " +
           "WHERE a.session.curriculum.study.id = :studyId " +
           "AND a.status = 'PENDING_ABSENCE' " +
           "ORDER BY a.respondedAt ASC")
    List<SessionAttendance> findPendingAbsencesByStudyId(Long studyId);

    /**
     * 특정 날짜의 회차들에 대한 참석 정보 조회 (캘린더용)
     */
    @Query("SELECT a FROM SessionAttendance a " +
           "WHERE a.session.curriculum.study.id = :studyId " +
           "AND a.session.sessionDate = :date " +
           "ORDER BY a.session.curriculum.weekNumber, a.session.sessionNumber")
    List<SessionAttendance> findByStudyIdAndSessionDate(Long studyId, LocalDate date);

    /**
     * 특정 스터디의 특정 월 회차들 조회 (캘린더용)
     */
    @Query("SELECT DISTINCT a.session.sessionDate FROM SessionAttendance a " +
           "WHERE a.session.curriculum.study.id = :studyId " +
           "AND a.session.sessionDate IS NOT NULL " +
           "AND YEAR(a.session.sessionDate) = :year " +
           "AND MONTH(a.session.sessionDate) = :month")
    List<LocalDate> findSessionDatesByStudyIdAndMonth(Long studyId, int year, int month);

    /**
     * 사용자가 응답해야 하는 회차 목록 (아직 응답 안 함 + 마감 전 + 취소되지 않음)
     */
    @Query("SELECT s FROM CurriculumSession s " +
           "WHERE s.curriculum.study.id = :studyId " +
           "AND s.sessionDate > :today " +
           "AND s.cancelled = false " +
           "AND NOT EXISTS (SELECT a FROM SessionAttendance a WHERE a.session = s AND a.user.id = :userId)")
    List<CurriculumSession> findPendingResponsesByUserAndStudy(Long userId, Long studyId, LocalDate today);
}
