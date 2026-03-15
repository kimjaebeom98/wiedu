package com.wiedu.service.notification;

import com.wiedu.domain.entity.CurriculumSession;
import com.wiedu.domain.entity.Notification;
import com.wiedu.domain.entity.Study;
import com.wiedu.domain.entity.StudyMember;
import com.wiedu.domain.entity.User;
import com.wiedu.domain.enums.MemberStatus;
import com.wiedu.domain.enums.NotificationType;
import com.wiedu.dto.notification.NotificationResponse;
import com.wiedu.exception.BusinessException;
import com.wiedu.exception.ErrorCode;
import com.wiedu.repository.notification.NotificationRepository;
import com.wiedu.repository.study.StudyMemberRepository;
import com.wiedu.service.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final StudyMemberRepository studyMemberRepository;
    private final UserService userService;

    /**
     * 사용자의 알림 목록 조회
     */
    public Page<NotificationResponse> getNotifications(Long userId, Pageable pageable) {
        User user = userService.findUserEntityById(userId);
        return notificationRepository.findByRecipient(user, pageable)
            .map(NotificationResponse::from);
    }

    /**
     * 읽지 않은 알림 수 조회
     */
    public long getUnreadCount(Long userId) {
        User user = userService.findUserEntityById(userId);
        return notificationRepository.countUnreadByRecipient(user);
    }

    /**
     * 특정 알림 읽음 처리
     */
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOTIFICATION_NOT_FOUND));

        if (!notification.getRecipient().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        notification.markAsRead();
    }

    /**
     * 모든 알림 읽음 처리
     */
    @Transactional
    public int markAllAsRead(Long userId) {
        User user = userService.findUserEntityById(userId);
        return notificationRepository.markAllAsRead(user);
    }

    /**
     * 스터디 완료 시 모든 멤버에게 리뷰 요청 알림 생성
     */
    @Transactional
    public void createReviewRequestNotifications(Study study) {
        List<StudyMember> members = studyMemberRepository.findByStudyAndStatus(study, MemberStatus.ACTIVE);

        for (StudyMember member : members) {
            Notification notification = Notification.builder()
                .recipient(member.getUser())
                .type(NotificationType.REVIEW_REQUEST)
                .title("스터디가 종료되었어요")
                .message("'" + study.getTitle() + "' 멤버들을 평가해주세요.")
                .targetId(study.getId())
                .targetType("STUDY")
                .build();

            notificationRepository.save(notification);
        }

        log.info("리뷰 요청 알림 생성 완료: studyId={}, memberCount={}", study.getId(), members.size());
    }

    /**
     * 스터디 가입 승인 알림 생성
     */
    @Transactional
    public void createStudyApprovedNotification(User recipient, Study study) {
        Notification notification = Notification.builder()
            .recipient(recipient)
            .type(NotificationType.STUDY_APPROVED)
            .title("스터디 참가가 승인되었어요!")
            .message("'" + study.getTitle() + "' 스터디에 참가하게 되었습니다.")
            .targetId(study.getId())
            .targetType("STUDY")
            .build();

        notificationRepository.save(notification);
        log.info("스터디 승인 알림 생성: userId={}, studyId={}", recipient.getId(), study.getId());
    }

    /**
     * 스터디 가입 거절 알림 생성
     */
    @Transactional
    public void createStudyRejectedNotification(User recipient, Study study) {
        Notification notification = Notification.builder()
            .recipient(recipient)
            .type(NotificationType.STUDY_REJECTED)
            .title("스터디 신청이 거절되었어요")
            .message("'" + study.getTitle() + "' 스터디 신청이 거절되었습니다.")
            .targetId(study.getId())
            .targetType("STUDY")
            .build();

        notificationRepository.save(notification);
        log.info("스터디 거절 알림 생성: userId={}, studyId={}", recipient.getId(), study.getId());
    }

    /**
     * 새 지원자 알림 생성 (리더에게)
     */
    @Transactional
    public void createNewApplicantNotification(User leader, Study study, String applicantNickname) {
        Notification notification = Notification.builder()
            .recipient(leader)
            .type(NotificationType.NEW_APPLICANT)
            .title("새로운 신청자가 있어요!")
            .message(applicantNickname + "님이 '" + study.getTitle() + "' 참가를 신청했습니다.")
            .targetId(study.getId())
            .targetType("STUDY")
            .build();

        notificationRepository.save(notification);
        log.info("새 지원자 알림 생성: leaderId={}, studyId={}", leader.getId(), study.getId());
    }

    /**
     * 새 회차 등록 알림 생성 (스터디 멤버들에게 - 리더 제외)
     */
    @Transactional
    public void createSessionCreatedNotifications(Study study, int weekNumber, int sessionNumber, String sessionTitle) {
        List<StudyMember> members = studyMemberRepository.findByStudyAndStatus(study, MemberStatus.ACTIVE);

        for (StudyMember member : members) {
            // 리더는 제외 (본인이 등록한 것이므로)
            if (member.getUser().getId().equals(study.getLeader().getId())) {
                continue;
            }

            Notification notification = Notification.builder()
                .recipient(member.getUser())
                .type(NotificationType.SESSION_CREATED)
                .title("새 회차가 등록되었어요!")
                .message("'" + study.getTitle() + "' " + weekNumber + "주차 " + sessionNumber + "회차: " + sessionTitle)
                .targetId(study.getId())
                .targetType("STUDY")
                .build();

            notificationRepository.save(notification);
        }

        log.info("회차 등록 알림 생성 완료: studyId={}, week={}, session={}", study.getId(), weekNumber, sessionNumber);
    }

    /**
     * 불참 신청 알림 생성 (리더에게)
     */
    @Transactional
    public void createAbsenceRequestNotification(User leader, User applicant, String sessionTitle, Long sessionId) {
        Notification notification = Notification.builder()
            .recipient(leader)
            .type(NotificationType.ABSENCE_REQUEST)
            .title("불참 신청이 있어요")
            .message(applicant.getNickname() + "님이 '" + sessionTitle + "' 회차에 불참 신청을 했습니다.")
            .targetId(sessionId)
            .targetType("SESSION")
            .build();

        notificationRepository.save(notification);
        log.info("불참 신청 알림 생성: leaderId={}, sessionId={}", leader.getId(), sessionId);
    }

    /**
     * 불참 승인 알림 생성
     */
    @Transactional
    public void createAbsenceApprovedNotification(User recipient, String sessionTitle, Long sessionId) {
        Notification notification = Notification.builder()
            .recipient(recipient)
            .type(NotificationType.ABSENCE_APPROVED)
            .title("불참 승인")
            .message("'" + sessionTitle + "' 회차의 불참 신청이 승인되었습니다.")
            .targetId(sessionId)
            .targetType("SESSION")
            .build();

        notificationRepository.save(notification);
        log.info("불참 승인 알림 생성: userId={}, sessionId={}", recipient.getId(), sessionId);
    }

    /**
     * 불참 거절 알림 생성
     */
    @Transactional
    public void createAbsenceRejectedNotification(User recipient, String sessionTitle, Long sessionId, String comment) {
        String message = "'" + sessionTitle + "' 회차의 불참 신청이 거절되었습니다.";
        if (comment != null && !comment.isBlank()) {
            message += " 사유: " + comment;
        }

        Notification notification = Notification.builder()
            .recipient(recipient)
            .type(NotificationType.ABSENCE_REJECTED)
            .title("불참 거절")
            .message(message)
            .targetId(sessionId)
            .targetType("SESSION")
            .build();

        notificationRepository.save(notification);
        log.info("불참 거절 알림 생성: userId={}, sessionId={}", recipient.getId(), sessionId);
    }

    /**
     * 회차 취소 알림 생성 (스터디 멤버들에게 - 리더 제외)
     */
    @Transactional
    public void createSessionCancelledNotifications(Study study, CurriculumSession session, String cancellationReason) {
        List<StudyMember> members = studyMemberRepository.findByStudyAndStatus(study, MemberStatus.ACTIVE);

        int weekNumber = session.getCurriculum().getWeekNumber();
        int sessionNumber = session.getSessionNumber();

        for (StudyMember member : members) {
            // 리더는 제외 (본인이 취소한 것이므로)
            if (member.getUser().getId().equals(study.getLeader().getId())) {
                continue;
            }

            String message = "'" + study.getTitle() + "' " + weekNumber + "주차 " + sessionNumber + "회차: " + session.getTitle() + "이(가) 취소되었습니다.";
            if (cancellationReason != null && !cancellationReason.isBlank()) {
                message += " 사유: " + cancellationReason;
            }

            Notification notification = Notification.builder()
                .recipient(member.getUser())
                .type(NotificationType.SESSION_CANCELLED)
                .title("회차가 취소되었어요")
                .message(message)
                .targetId(study.getId())
                .targetType("STUDY")
                .build();

            notificationRepository.save(notification);
        }

        log.info("회차 취소 알림 생성 완료: studyId={}, sessionId={}", study.getId(), session.getId());
    }

}
