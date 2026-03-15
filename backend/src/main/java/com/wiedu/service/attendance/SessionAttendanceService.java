package com.wiedu.service.attendance;

import com.wiedu.domain.entity.CurriculumSession;
import com.wiedu.domain.entity.SessionAttendance;
import com.wiedu.domain.entity.Study;
import com.wiedu.domain.entity.User;
import com.wiedu.domain.enums.AttendanceStatus;
import com.wiedu.domain.enums.MemberStatus;
import com.wiedu.dto.attendance.*;
import com.wiedu.exception.BusinessException;
import com.wiedu.exception.ErrorCode;
import com.wiedu.repository.study.CurriculumSessionRepository;
import com.wiedu.repository.study.SessionAttendanceRepository;
import com.wiedu.repository.study.StudyMemberRepository;
import com.wiedu.repository.user.UserRepository;
import com.wiedu.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SessionAttendanceService {

    private final SessionAttendanceRepository attendanceRepository;
    private final CurriculumSessionRepository sessionRepository;
    private final StudyMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    /**
     * 회차 참석 현황 조회
     */
    public AttendanceSummaryResponse getAttendanceSummary(Long sessionId, Long userId) {
        CurriculumSession session = findSessionById(sessionId);
        validateStudyMember(session.getCurriculum().getStudy(), userId);

        List<AttendanceResponse> attendances = attendanceRepository
            .findBySessionIdOrderByRespondedAtDesc(sessionId)
            .stream()
            .map(AttendanceResponse::from)
            .toList();

        int totalMembers = memberRepository.countByStudyIdAndStatus(
            session.getCurriculum().getStudy().getId(), MemberStatus.ACTIVE);

        return AttendanceSummaryResponse.of(sessionId, totalMembers, attendances);
    }

    /**
     * 내 참석 응답 조회
     */
    public AttendanceResponse getMyAttendance(Long sessionId, Long userId) {
        CurriculumSession session = findSessionById(sessionId);
        validateStudyMember(session.getCurriculum().getStudy(), userId);

        return attendanceRepository.findBySessionIdAndUserId(sessionId, userId)
            .map(AttendanceResponse::from)
            .orElse(null);
    }

    /**
     * 참석/불참 응답
     */
    @Transactional
    public AttendanceResponse respond(Long sessionId, Long userId, AttendanceRequest request) {
        CurriculumSession session = findSessionById(sessionId);
        Study study = session.getCurriculum().getStudy();
        validateStudyMember(study, userId);

        // 취소된 세션 확인
        if (session.isCancelled()) {
            throw new BusinessException(ErrorCode.SESSION_ALREADY_CANCELLED);
        }

        // 응답 기한 확인 (회차 하루 전까지)
        if (session.getSessionDate() != null) {
            LocalDate deadline = session.getSessionDate().minusDays(1);
            if (LocalDate.now().isAfter(deadline)) {
                throw new BusinessException(ErrorCode.ATTENDANCE_DEADLINE_PASSED);
            }
        }

        User user = findUserById(userId);
        SessionAttendance attendance = attendanceRepository
            .findBySessionIdAndUserId(sessionId, userId)
            .orElse(SessionAttendance.builder()
                .session(session)
                .user(user)
                .status(AttendanceStatus.ATTENDING)
                .build());

        if (request.attending()) {
            attendance.markAsAttending();
        } else {
            if (request.absenceReason() == null || request.absenceReason().isBlank()) {
                throw new BusinessException(ErrorCode.ABSENCE_REASON_REQUIRED);
            }
            attendance.markAsAbsent(request.absenceReason());

            // 스터디장에게 알림
            notifyLeaderAboutAbsence(study, user, session);
        }

        SessionAttendance saved = attendanceRepository.save(attendance);
        log.info("참석 응답: sessionId={}, userId={}, attending={}", sessionId, userId, request.attending());

        return AttendanceResponse.from(saved);
    }

    /**
     * 불참 승인/거절 (스터디장만)
     */
    @Transactional
    public AttendanceResponse processAbsence(Long attendanceId, Long userId, AttendanceApprovalRequest request) {
        SessionAttendance attendance = findAttendanceById(attendanceId);
        Study study = attendance.getSession().getCurriculum().getStudy();
        validateStudyLeader(study, userId);

        if (attendance.getStatus() != AttendanceStatus.PENDING_ABSENCE) {
            throw new BusinessException(ErrorCode.INVALID_ATTENDANCE_STATUS);
        }

        User approver = findUserById(userId);

        if (request.approved()) {
            attendance.approveAbsence(approver);
            // 승인 알림
            notificationService.createAbsenceApprovedNotification(
                attendance.getUser(),
                attendance.getSession().getTitle(),
                attendance.getSession().getId()
            );
        } else {
            attendance.rejectAbsence(approver, request.comment());
            // 거절 알림 (다시 응답해야 함)
            notificationService.createAbsenceRejectedNotification(
                attendance.getUser(),
                attendance.getSession().getTitle(),
                attendance.getSession().getId(),
                request.comment()
            );
        }

        log.info("불참 처리: attendanceId={}, approved={}", attendanceId, request.approved());
        return AttendanceResponse.from(attendance);
    }

    /**
     * 승인 대기 중인 불참 목록 조회 (스터디장용)
     */
    public List<AttendanceResponse> getPendingAbsences(Long studyId, Long userId) {
        Study study = findStudyById(studyId);
        validateStudyLeader(study, userId);

        return attendanceRepository.findPendingAbsencesByStudyId(studyId)
            .stream()
            .map(AttendanceResponse::from)
            .toList();
    }

    /**
     * 특정 날짜의 회차별 참석 현황 (캘린더용)
     */
    public List<AttendanceSummaryResponse> getAttendancesByDate(Long studyId, LocalDate date, Long userId) {
        Study study = findStudyById(studyId);
        validateStudyMember(study, userId);

        // 해당 날짜의 회차들 조회
        List<CurriculumSession> sessions = sessionRepository.findAllByStudyId(studyId)
            .stream()
            .filter(s -> date.equals(s.getSessionDate()))
            .toList();

        int totalMembers = memberRepository.countByStudyIdAndStatus(studyId, MemberStatus.ACTIVE);

        return sessions.stream()
            .map(session -> {
                List<AttendanceResponse> attendances = attendanceRepository
                    .findBySessionIdOrderByRespondedAtDesc(session.getId())
                    .stream()
                    .map(AttendanceResponse::from)
                    .toList();
                return AttendanceSummaryResponse.of(session.getId(), totalMembers, attendances);
            })
            .toList();
    }

    /**
     * 회차가 있는 날짜 목록 조회 (캘린더용)
     */
    public List<LocalDate> getSessionDatesInMonth(Long studyId, int year, int month, Long userId) {
        Study study = findStudyById(studyId);
        validateStudyMember(study, userId);

        return sessionRepository.findAllByStudyId(studyId)
            .stream()
            .filter(s -> s.getSessionDate() != null)
            .filter(s -> s.getSessionDate().getYear() == year && s.getSessionDate().getMonthValue() == month)
            .map(CurriculumSession::getSessionDate)
            .distinct()
            .toList();
    }

    /**
     * 회차 취소 (스터디장만)
     */
    @Transactional
    public void cancelSession(Long sessionId, Long userId, String reason) {
        CurriculumSession session = findSessionById(sessionId);
        Study study = session.getCurriculum().getStudy();
        validateStudyLeader(study, userId);

        if (session.isCancelled()) {
            throw new BusinessException(ErrorCode.SESSION_ALREADY_CANCELLED);
        }

        if (reason == null || reason.isBlank()) {
            throw new BusinessException(ErrorCode.CANCELLATION_REASON_REQUIRED);
        }

        session.cancel(reason);
        sessionRepository.save(session);

        // 모든 스터디원에게 알림 발송
        notificationService.createSessionCancelledNotifications(study, session, reason);

        log.info("회차 취소: sessionId={}, reason={}", sessionId, reason);
    }

    // === Private helper methods ===

    private void notifyLeaderAboutAbsence(Study study, User user, CurriculumSession session) {
        notificationService.createAbsenceRequestNotification(
            study.getLeader(),
            user,
            session.getTitle(),
            session.getId()
        );
    }

    private CurriculumSession findSessionById(Long sessionId) {
        return sessionRepository.findById(sessionId)
            .orElseThrow(() -> new BusinessException(ErrorCode.SESSION_NOT_FOUND));
    }

    private SessionAttendance findAttendanceById(Long attendanceId) {
        return attendanceRepository.findById(attendanceId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ATTENDANCE_NOT_FOUND));
    }

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    private Study findStudyById(Long studyId) {
        return memberRepository.findByStudyIdAndStatus(studyId, MemberStatus.ACTIVE)
            .stream()
            .findFirst()
            .map(m -> m.getStudy())
            .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));
    }

    private void validateStudyMember(Study study, Long userId) {
        boolean isMember = memberRepository.existsByStudyIdAndUserIdAndStatus(
            study.getId(), userId, MemberStatus.ACTIVE);
        if (!isMember) {
            throw new BusinessException(ErrorCode.NOT_STUDY_MEMBER);
        }
    }

    private void validateStudyLeader(Study study, Long userId) {
        if (!study.getLeader().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.NOT_STUDY_LEADER);
        }
    }
}
