package com.wiedu.service.study;

import com.wiedu.domain.entity.Study;
import com.wiedu.domain.entity.StudyMember;
import com.wiedu.domain.entity.User;
import com.wiedu.domain.entity.WithdrawalRequest;
import com.wiedu.domain.enums.MemberStatus;
import com.wiedu.domain.enums.RequestStatus;
import com.wiedu.dto.study.WithdrawalRequestResponse;
import com.wiedu.exception.BusinessException;
import com.wiedu.exception.ErrorCode;
import com.wiedu.repository.study.StudyMemberRepository;
import com.wiedu.repository.study.StudyRepository;
import com.wiedu.repository.study.StudyRequestRepository;
import com.wiedu.repository.study.WithdrawalRequestRepository;
import com.wiedu.service.notification.NotificationService;
import com.wiedu.service.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 스터디 탈퇴 신청 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WithdrawalRequestService {

    private final WithdrawalRequestRepository withdrawalRequestRepository;
    private final StudyMemberRepository studyMemberRepository;
    private final StudyRepository studyRepository;
    private final StudyRequestRepository studyRequestRepository;
    private final StudyService studyService;
    private final UserService userService;
    private final NotificationService notificationService;

    /**
     * 스터디 탈퇴 신청
     */
    @Transactional
    public WithdrawalRequestResponse requestWithdrawal(Long studyId, Long userId, String reason) {
        Study study = studyService.findStudyEntityById(studyId);
        User user = userService.findUserEntityById(userId);

        // 멤버인지 확인
        StudyMember member = studyMemberRepository.findByStudyAndUser(study, user)
                .filter(StudyMember::isActive)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_MEMBER));

        // 리더는 탈퇴 신청 불가 (리더 위임 후 탈퇴해야 함)
        if (member.isLeader()) {
            throw new BusinessException(ErrorCode.LEADER_CANNOT_REQUEST_WITHDRAWAL);
        }

        // 이미 탈퇴 신청했는지 확인 (대기 중인 신청)
        if (withdrawalRequestRepository.existsByStudyAndUserAndStatus(study, user, RequestStatus.PENDING)) {
            throw new BusinessException(ErrorCode.WITHDRAWAL_ALREADY_REQUESTED);
        }

        WithdrawalRequest withdrawalRequest = WithdrawalRequest.builder()
                .study(study)
                .user(user)
                .reason(reason)
                .build();

        WithdrawalRequest savedRequest = withdrawalRequestRepository.save(withdrawalRequest);

        // 스터디장에게 탈퇴 신청 알림 발송
        notificationService.createWithdrawalRequestNotification(
                study.getLeader(),
                study,
                user.getNickname()
        );

        log.info("탈퇴 신청 생성: userId={}, studyId={}", userId, studyId);
        return WithdrawalRequestResponse.from(savedRequest);
    }

    /**
     * 탈퇴 신청 승인 (리더만 가능)
     */
    @Transactional
    public void approveWithdrawal(Long requestId, Long leaderId) {
        WithdrawalRequest request = findRequestEntityById(requestId);
        Study study = request.getStudy();

        // 리더 권한 확인
        if (!study.getLeader().getId().equals(leaderId)) {
            throw new BusinessException(ErrorCode.NOT_STUDY_LEADER);
        }

        // 이미 처리된 신청인지 확인
        if (!request.isPending()) {
            throw new BusinessException(ErrorCode.WITHDRAWAL_REQUEST_ALREADY_PROCESSED);
        }

        // 멤버 탈퇴 처리
        User withdrawingUser = request.getUser();
        StudyMember member = studyMemberRepository.findByStudyAndUser(study, withdrawingUser)
                .filter(StudyMember::isActive)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_MEMBER));

        // 멤버 삭제 (Hard Delete)
        studyMemberRepository.delete(member);

        // 현재 인원 감소
        studyRepository.decrementMemberCount(study.getId());

        // 기존 가입 신청 기록 삭제 (재가입 시 유니크 제약 문제 방지)
        studyRequestRepository.findByStudyAndUser(study, withdrawingUser)
                .ifPresent(studyRequestRepository::delete);

        // 탈퇴 신청 기록 삭제 (재탈퇴 신청 시 중복 방지)
        withdrawalRequestRepository.delete(request);

        // 신청자에게 탈퇴 승인 알림 발송
        notificationService.createWithdrawalApprovedNotification(withdrawingUser, study);

        log.info("탈퇴 승인 완료: requestId={}, userId={}, studyId={}", requestId, withdrawingUser.getId(), study.getId());
    }

    /**
     * 탈퇴 신청 취소 (신청자 본인만 가능)
     */
    @Transactional
    public void cancelWithdrawalRequest(Long requestId, Long userId) {
        WithdrawalRequest request = findRequestEntityById(requestId);

        // 신청자 본인인지 확인
        if (!request.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.NOT_WITHDRAWAL_REQUEST_OWNER);
        }

        // 대기 중인 신청만 취소 가능
        if (!request.isPending()) {
            throw new BusinessException(ErrorCode.WITHDRAWAL_REQUEST_ALREADY_PROCESSED);
        }

        Study study = request.getStudy();

        // 스터디장에게 보낸 탈퇴 신청 알림 삭제
        notificationService.deleteWithdrawalRequestNotification(study.getLeader(), study.getId());

        withdrawalRequestRepository.delete(request);
        log.info("탈퇴 신청 취소: requestId={}, userId={}", requestId, userId);
    }

    /**
     * 스터디의 대기 중인 탈퇴 신청 목록 (리더용)
     */
    public Page<WithdrawalRequestResponse> findPendingWithdrawalRequests(Long studyId, Long leaderId, Pageable pageable) {
        Study study = studyService.findStudyEntityById(studyId);

        // 리더 권한 확인
        if (!study.getLeader().getId().equals(leaderId)) {
            throw new BusinessException(ErrorCode.NOT_STUDY_LEADER);
        }

        return withdrawalRequestRepository.findByStudyAndStatus(study, RequestStatus.PENDING, pageable)
                .map(WithdrawalRequestResponse::from);
    }

    /**
     * 스터디의 대기 중인 탈퇴 신청 수
     */
    public long countPendingWithdrawalRequests(Long studyId, Long leaderId) {
        Study study = studyService.findStudyEntityById(studyId);

        // 리더 권한 확인
        if (!study.getLeader().getId().equals(leaderId)) {
            throw new BusinessException(ErrorCode.NOT_STUDY_LEADER);
        }

        return withdrawalRequestRepository.countByStudyAndStatus(study, RequestStatus.PENDING);
    }

    /**
     * 사용자의 탈퇴 신청 목록
     */
    public List<WithdrawalRequestResponse> findMyWithdrawalRequests(Long userId) {
        User user = userService.findUserEntityById(userId);
        return withdrawalRequestRepository.findByUser(user)
                .stream()
                .map(WithdrawalRequestResponse::from)
                .toList();
    }

    /**
     * 특정 스터디에 대한 내 탈퇴 신청 조회 (PENDING 상태만)
     */
    public WithdrawalRequestResponse findMyWithdrawalRequestForStudy(Long studyId, Long userId) {
        Study study = studyService.findStudyEntityById(studyId);
        User user = userService.findUserEntityById(userId);

        return withdrawalRequestRepository.findByStudyAndUserAndStatus(study, user, RequestStatus.PENDING)
                .map(WithdrawalRequestResponse::from)
                .orElse(null);
    }

    /**
     * 내부용: Entity 조회
     */
    private WithdrawalRequest findRequestEntityById(Long requestId) {
        return withdrawalRequestRepository.findById(requestId)
                .orElseThrow(() -> new BusinessException(ErrorCode.WITHDRAWAL_REQUEST_NOT_FOUND));
    }
}
