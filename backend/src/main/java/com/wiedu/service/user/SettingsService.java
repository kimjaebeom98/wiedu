package com.wiedu.service.user;

import com.wiedu.domain.entity.User;
import com.wiedu.dto.user.NotificationSettingsRequest;
import com.wiedu.dto.user.NotificationSettingsResponse;
import com.wiedu.exception.BusinessException;
import com.wiedu.exception.ErrorCode;
import com.wiedu.repository.auth.RefreshTokenRepository;
import com.wiedu.repository.board.BoardCommentLikeRepository;
import com.wiedu.repository.board.BoardCommentRepository;
import com.wiedu.repository.board.BoardPostLikeRepository;
import com.wiedu.repository.board.BoardPostRepository;
import com.wiedu.repository.notification.NotificationRepository;
import com.wiedu.repository.study.*;
import com.wiedu.repository.user.UserInterestRepository;
import com.wiedu.repository.user.UserRepository;
import com.wiedu.repository.user.UserStudyPreferenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 설정 서비스 (알림 설정, 회원 탈퇴)
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SettingsService {

    private final UserService userService;
    private final UserRepository userRepository;
    private final StudyRepository studyRepository;
    private final StudyMemberRepository studyMemberRepository;
    private final StudyRequestRepository studyRequestRepository;
    private final WithdrawalRequestRepository withdrawalRequestRepository;
    private final StudyBookmarkRepository studyBookmarkRepository;
    private final BoardPostRepository boardPostRepository;
    private final BoardPostLikeRepository boardPostLikeRepository;
    private final BoardCommentRepository boardCommentRepository;
    private final BoardCommentLikeRepository boardCommentLikeRepository;
    private final NotificationRepository notificationRepository;
    private final UserInterestRepository userInterestRepository;
    private final UserStudyPreferenceRepository userStudyPreferenceRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * 알림 설정 조회
     */
    public NotificationSettingsResponse getNotificationSettings(Long userId) {
        User user = userService.findUserEntityById(userId);
        return NotificationSettingsResponse.from(user);
    }

    /**
     * 알림 설정 업데이트
     */
    @Transactional
    public NotificationSettingsResponse updateNotificationSettings(Long userId, NotificationSettingsRequest request) {
        User user = userService.findUserEntityById(userId);

        boolean push = request.getPush() != null ? request.getPush() : user.isPushNotificationEnabled();
        boolean chat = request.getChat() != null ? request.getChat() : user.isChatNotificationEnabled();
        boolean study = request.getStudy() != null ? request.getStudy() : user.isStudyNotificationEnabled();

        user.updateNotificationSettings(push, chat, study);
        return NotificationSettingsResponse.from(user);
    }

    /**
     * 회원 탈퇴 (하이브리드 방식)
     * 1. 스터디 리더인 경우 탈퇴 불가 (먼저 리더 위임 필요)
     * 2. 사용자 정보 익명화 (status=WITHDRAWN, 개인정보 삭제)
     * 3. 게시글/댓글 작성자는 유지 → 화면에서 "탈퇴한 사용자"로 표시
     * 4. 좋아요, 북마크, 알림, 멤버십 등 삭제
     */
    @Transactional
    public void withdraw(Long userId) {
        User user = userService.findUserEntityById(userId);

        // 1. 스터디 리더인지 확인 (리더인 스터디가 있으면 탈퇴 불가)
        if (studyRepository.existsByLeaderId(userId)) {
            throw new BusinessException(ErrorCode.LEADER_CANNOT_WITHDRAW);
        }

        log.info("회원 탈퇴 시작: userId={}", userId);

        // 2. 사용자 정보 익명화 (soft delete + 개인정보 삭제)
        user.anonymize();

        // 3. 좋아요한 게시글/댓글의 like_count 감소 (삭제 전에 먼저 처리)
        boardPostRepository.decrementLikeCountByUserId(userId);
        boardCommentRepository.decrementLikeCountByUserId(userId);

        // 4. 사용자 고유 데이터 삭제
        studyRequestRepository.deleteByUserId(userId);
        withdrawalRequestRepository.deleteByUserId(userId);
        studyBookmarkRepository.deleteByUserId(userId);
        boardPostLikeRepository.deleteByUserId(userId);
        boardCommentLikeRepository.deleteByUserId(userId);
        notificationRepository.deleteByRecipientId(userId);
        userInterestRepository.deleteByUserId(userId);
        userStudyPreferenceRepository.deleteByUserId(userId);
        refreshTokenRepository.deleteByUserId(userId);

        // 5. 스터디 멤버십 삭제
        studyMemberRepository.deleteByUserId(userId);

        log.info("회원 탈퇴 완료: userId={}", userId);
    }
}
