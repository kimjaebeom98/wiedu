package com.wiedu.service.curriculum;

import com.wiedu.domain.entity.CurriculumSession;
import com.wiedu.domain.entity.Study;
import com.wiedu.domain.entity.StudyCurriculum;
import com.wiedu.dto.curriculum.*;
import com.wiedu.exception.BusinessException;
import com.wiedu.exception.ErrorCode;
import com.wiedu.domain.enums.MemberStatus;
import com.wiedu.repository.study.CurriculumSessionRepository;
import com.wiedu.repository.study.StudyCurriculumRepository;
import com.wiedu.repository.study.StudyMemberRepository;
import com.wiedu.repository.user.UserRepository;
import com.wiedu.service.notification.NotificationService;
import com.wiedu.service.study.StudyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CurriculumService {

    private final StudyCurriculumRepository curriculumRepository;
    private final CurriculumSessionRepository sessionRepository;
    private final StudyMemberRepository studyMemberRepository;
    private final UserRepository userRepository;
    private final StudyService studyService;
    private final NotificationService notificationService;

    /**
     * 스터디의 모든 커리큘럼 조회 (세션 카운트 포함)
     */
    public List<CurriculumResponse> getCurriculums(Long studyId) {
        List<StudyCurriculum> curriculums = curriculumRepository.findByStudyIdOrderByWeekNumber(studyId);
        return curriculums.stream()
            .map(c -> CurriculumResponse.fromWithoutSessions(c, sessionRepository.countByCurriculumId(c.getId())))
            .toList();
    }

    /**
     * 커리큘럼 상세 조회 (세션 목록 포함) - 스터디원만 가능
     */
    public CurriculumResponse getCurriculumDetail(Long curriculumId, Long userId) {
        StudyCurriculum curriculum = findCurriculumById(curriculumId);

        // 스터디원 확인
        validateStudyMember(curriculum.getStudy(), userId);

        List<SessionResponse> sessions = sessionRepository.findByCurriculumIdOrderBySessionNumber(curriculumId)
            .stream()
            .map(SessionResponse::from)
            .toList();
        return CurriculumResponse.from(curriculum, sessions);
    }

    /**
     * 커리큘럼 추가
     */
    @Transactional
    public CurriculumResponse addCurriculum(Long studyId, Long userId) {
        Study study = studyService.findStudyEntityById(studyId);
        validateStudyLeader(study, userId);

        List<StudyCurriculum> existingCurriculums = curriculumRepository.findByStudyIdOrderByWeekNumber(studyId);
        int newWeekNumber = existingCurriculums.isEmpty() ? 1 : existingCurriculums.size() + 1;

        StudyCurriculum curriculum = StudyCurriculum.create(study, newWeekNumber, newWeekNumber + "주차", "");
        StudyCurriculum saved = curriculumRepository.save(curriculum);

        log.info("커리큘럼 추가: studyId={}, weekNumber={}", studyId, newWeekNumber);
        return CurriculumResponse.fromWithoutSessions(saved, 0);
    }

    /**
     * 커리큘럼 수정
     */
    @Transactional
    public CurriculumResponse updateCurriculum(Long curriculumId, Long userId, CurriculumUpdateRequest request) {
        StudyCurriculum curriculum = findCurriculumById(curriculumId);
        validateStudyLeader(curriculum.getStudy(), userId);

        curriculum.update(request.title(), request.content());
        int sessionCount = sessionRepository.countByCurriculumId(curriculumId);

        log.info("커리큘럼 수정: curriculumId={}", curriculumId);
        return CurriculumResponse.fromWithoutSessions(curriculum, sessionCount);
    }

    /**
     * 커리큘럼 삭제
     */
    @Transactional
    public void deleteCurriculum(Long curriculumId, Long userId) {
        StudyCurriculum curriculum = findCurriculumById(curriculumId);
        validateStudyLeader(curriculum.getStudy(), userId);

        // 세션 먼저 삭제
        sessionRepository.deleteAllByCurriculumId(curriculumId);
        curriculumRepository.delete(curriculum);

        // 남은 커리큘럼 주차 번호 재정렬
        List<StudyCurriculum> remainingCurriculums = curriculumRepository.findByStudyIdOrderByWeekNumber(curriculum.getStudy().getId());
        for (int i = 0; i < remainingCurriculums.size(); i++) {
            remainingCurriculums.get(i).updateWeekNumber(i + 1);
        }

        log.info("커리큘럼 삭제: curriculumId={}", curriculumId);
    }

    /**
     * 세션 목록 조회
     */
    public List<SessionResponse> getSessions(Long curriculumId) {
        return sessionRepository.findByCurriculumIdOrderBySessionNumber(curriculumId)
            .stream()
            .map(SessionResponse::from)
            .toList();
    }

    /**
     * 세션 상세 조회
     */
    public SessionResponse getSession(Long sessionId) {
        CurriculumSession session = findSessionById(sessionId);
        return SessionResponse.from(session);
    }

    /**
     * 세션 추가
     */
    @Transactional
    public SessionResponse addSession(Long curriculumId, Long userId, SessionRequest request) {
        StudyCurriculum curriculum = findCurriculumById(curriculumId);
        validateStudyLeader(curriculum.getStudy(), userId);

        // 주당 최대 7회차 제한
        int existingCount = sessionRepository.countByCurriculumId(curriculumId);
        if (existingCount >= 7) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "주당 최대 7회차까지 추가할 수 있습니다.");
        }

        CurriculumSession session = CurriculumSession.builder()
            .curriculum(curriculum)
            .sessionNumber(request.sessionNumber())
            .title(request.title())
            .content(request.content())
            .sessionDate(request.sessionDate())
            .sessionTime(request.sessionTime())
            .sessionMode(request.sessionMode())
            .meetingLink(request.meetingLink())
            .meetingLocation(request.meetingLocation())
            .build();

        CurriculumSession saved = sessionRepository.save(session);
        log.info("세션 추가: curriculumId={}, sessionNumber={}", curriculumId, request.sessionNumber());

        // 스터디 멤버들에게 알림 발송
        notificationService.createSessionCreatedNotifications(
            curriculum.getStudy(),
            curriculum.getWeekNumber(),
            request.sessionNumber(),
            request.title()
        );

        return SessionResponse.from(saved);
    }

    /**
     * 세션 수정
     */
    @Transactional
    public SessionResponse updateSession(Long sessionId, Long userId, SessionRequest request) {
        CurriculumSession session = findSessionById(sessionId);
        validateStudyLeader(session.getCurriculum().getStudy(), userId);

        session.update(
            request.title(),
            request.content(),
            request.sessionDate(),
            request.sessionTime(),
            request.sessionMode(),
            request.meetingLink(),
            request.meetingLocation()
        );

        if (!session.getSessionNumber().equals(request.sessionNumber())) {
            session.updateSessionNumber(request.sessionNumber());
        }

        log.info("세션 수정: sessionId={}", sessionId);
        return SessionResponse.from(session);
    }

    /**
     * 세션 삭제
     */
    @Transactional
    public void deleteSession(Long sessionId, Long userId) {
        CurriculumSession session = findSessionById(sessionId);
        validateStudyLeader(session.getCurriculum().getStudy(), userId);

        Long curriculumId = session.getCurriculum().getId();
        sessionRepository.delete(session);

        // 남은 세션 번호 재정렬
        List<CurriculumSession> remainingSessions = sessionRepository.findByCurriculumIdOrderBySessionNumber(curriculumId);
        for (int i = 0; i < remainingSessions.size(); i++) {
            remainingSessions.get(i).updateSessionNumber(i + 1);
        }

        log.info("세션 삭제: sessionId={}", sessionId);
    }

    private StudyCurriculum findCurriculumById(Long curriculumId) {
        return curriculumRepository.findById(curriculumId)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "커리큘럼을 찾을 수 없습니다."));
    }

    private CurriculumSession findSessionById(Long sessionId) {
        return sessionRepository.findById(sessionId)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "세션을 찾을 수 없습니다."));
    }

    private void validateStudyLeader(Study study, Long userId) {
        if (!study.getLeader().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "스터디장만 커리큘럼을 수정할 수 있습니다.");
        }
    }

    private void validateStudyMember(Study study, Long userId) {
        var user = userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "사용자를 찾을 수 없습니다."));

        boolean isMember = studyMemberRepository.existsByStudyAndUserAndStatus(study, user, MemberStatus.ACTIVE);
        if (!isMember) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "스터디 멤버만 회차 정보를 볼 수 있습니다.");
        }
    }
}
