package com.wiedu.service.user;

import com.wiedu.domain.entity.User;
import com.wiedu.exception.BusinessException;
import com.wiedu.exception.ErrorCode;
import com.wiedu.repository.auth.RefreshTokenRepository;
import com.wiedu.repository.board.BoardCommentLikeRepository;
import com.wiedu.repository.board.BoardCommentRepository;
import com.wiedu.repository.board.BoardPostLikeRepository;
import com.wiedu.repository.board.BoardPostRepository;
import com.wiedu.repository.gallery.GalleryPhotoRepository;
import com.wiedu.repository.notification.NotificationRepository;
import com.wiedu.repository.review.StudyLeaderReviewRepository;
import com.wiedu.repository.review.StudyMemberReviewRepository;
import com.wiedu.repository.study.*;
import com.wiedu.repository.user.UserInterestRepository;
import com.wiedu.repository.user.UserRepository;
import com.wiedu.repository.user.UserStudyPreferenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 사용자 완전 삭제 서비스 (관리자용 / GDPR 요청 대응)
 *
 * ⚠️ 일반 회원 탈퇴는 SettingsService.withdraw()를 사용하세요!
 * 이 서비스는 사용자 데이터를 DB에서 완전히 삭제합니다.
 *
 * - 작성 콘텐츠(게시글, 댓글, 출석 등)는 author를 NULL로 설정하여 "알 수 없음" 처리
 * - 사용자 고유 데이터(신청, 북마크, 좋아요 등)는 삭제
 * - 사용자 레코드 자체를 DB에서 삭제 (Hard Delete)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserDeletionService {

    private final UserRepository userRepository;
    private final StudyRepository studyRepository;
    private final StudyMemberRepository studyMemberRepository;
    private final StudyRequestRepository studyRequestRepository;
    private final WithdrawalRequestRepository withdrawalRequestRepository;
    private final StudyBookmarkRepository studyBookmarkRepository;
    private final BoardPostRepository boardPostRepository;
    private final BoardCommentRepository boardCommentRepository;
    private final BoardPostLikeRepository boardPostLikeRepository;
    private final BoardCommentLikeRepository boardCommentLikeRepository;
    private final GalleryPhotoRepository galleryPhotoRepository;
    private final SessionAttendanceRepository sessionAttendanceRepository;
    private final NotificationRepository notificationRepository;
    private final UserInterestRepository userInterestRepository;
    private final UserStudyPreferenceRepository userStudyPreferenceRepository;
    private final StudyLeaderReviewRepository studyLeaderReviewRepository;
    private final StudyMemberReviewRepository studyMemberReviewRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * 사용자 삭제 (탈퇴)
     * - 스터디 리더인 경우 삭제 불가 (먼저 리더 위임 필요)
     */
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 스터디 리더인지 확인 (리더인 스터디가 있으면 삭제 불가)
        if (studyRepository.existsByLeaderId(userId)) {
            throw new BusinessException(ErrorCode.LEADER_CANNOT_WITHDRAW);
        }

        log.info("사용자 삭제 시작: userId={}", userId);

        // 1. 콘텐츠 작성자를 NULL로 설정 (알 수 없음 처리)
        boardPostRepository.setAuthorToNull(userId);
        boardCommentRepository.setAuthorToNull(userId);
        galleryPhotoRepository.setUploaderToNull(userId);
        sessionAttendanceRepository.setUserToNull(userId);
        studyLeaderReviewRepository.setReviewerToNull(userId);
        studyMemberReviewRepository.setReviewerToNull(userId);

        // 2. 사용자 고유 데이터 삭제
        studyRequestRepository.deleteByUserId(userId);
        withdrawalRequestRepository.deleteByUserId(userId);
        studyBookmarkRepository.deleteByUserId(userId);
        boardPostLikeRepository.deleteByUserId(userId);
        boardCommentLikeRepository.deleteByUserId(userId);
        notificationRepository.deleteByRecipientId(userId);
        userInterestRepository.deleteByUserId(userId);
        userStudyPreferenceRepository.deleteByUserId(userId);
        refreshTokenRepository.deleteByUserId(userId);

        // 3. 스터디 멤버십 삭제
        studyMemberRepository.deleteByUserId(userId);

        // 4. 사용자 삭제
        userRepository.delete(user);

        log.info("사용자 삭제 완료: userId={}", userId);
    }
}
