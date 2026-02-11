package com.wiedu.service.study;

import com.wiedu.domain.entity.Study;
import com.wiedu.domain.entity.StudyMember;
import com.wiedu.domain.entity.StudyRequest;
import com.wiedu.domain.entity.User;
import com.wiedu.domain.enums.MemberRole;
import com.wiedu.domain.enums.MemberStatus;
import com.wiedu.domain.enums.RequestStatus;
import com.wiedu.dto.study.StudyJoinRequest;
import com.wiedu.dto.study.StudyRequestResponse;
import com.wiedu.exception.BusinessException;
import com.wiedu.exception.ErrorCode;
import com.wiedu.repository.study.StudyMemberRepository;
import com.wiedu.repository.study.StudyRequestRepository;
import com.wiedu.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 스터디 가입 신청 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyRequestService {

    private final StudyRequestRepository studyRequestRepository;
    private final StudyMemberRepository studyMemberRepository;
    private final StudyService studyService;
    private final UserService userService;

    /**
     * 스터디 가입 신청
     */
    @Transactional
    public StudyRequestResponse applyToStudy(Long studyId, Long userId, StudyJoinRequest request) {
        Study study = studyService.findStudyEntityById(studyId);
        User user = userService.findUserEntityById(userId);

        // 모집 중인지 확인
        if (!study.isRecruiting()) {
            throw new BusinessException(ErrorCode.STUDY_NOT_RECRUITING);
        }

        // 이미 멤버인지 확인
        if (studyMemberRepository.existsByStudyAndUserAndStatus(study, user, MemberStatus.ACTIVE)) {
            throw new BusinessException(ErrorCode.ALREADY_MEMBER);
        }

        // 이미 신청했는지 확인 (대기 중인 신청)
        if (studyRequestRepository.existsByStudyAndUserAndStatus(study, user, RequestStatus.PENDING)) {
            throw new BusinessException(ErrorCode.ALREADY_REQUESTED);
        }

        StudyRequest studyRequest = StudyRequest.builder()
                .study(study)
                .user(user)
                .message(request.message())
                .build();

        StudyRequest savedRequest = studyRequestRepository.save(studyRequest);
        return StudyRequestResponse.from(savedRequest);
    }

    /**
     * 가입 신청 승인 (리더만 가능)
     */
    @Transactional
    public void approveRequest(Long requestId, Long leaderId) {
        StudyRequest request = findRequestEntityById(requestId);
        Study study = request.getStudy();

        // 리더 권한 확인
        if (!study.getLeader().getId().equals(leaderId)) {
            throw new BusinessException(ErrorCode.NOT_STUDY_LEADER);
        }

        // 이미 처리된 신청인지 확인
        if (!request.isPending()) {
            throw new BusinessException(ErrorCode.REQUEST_ALREADY_PROCESSED);
        }

        // 정원 초과 확인
        if (study.isFull()) {
            throw new BusinessException(ErrorCode.STUDY_FULL);
        }

        // 신청 승인
        request.approve();

        // 멤버로 등록
        StudyMember newMember = StudyMember.builder()
                .study(study)
                .user(request.getUser())
                .role(MemberRole.MEMBER)
                .build();
        studyMemberRepository.save(newMember);

        // 현재 인원 증가
        study.incrementMember();
    }

    /**
     * 가입 신청 거절 (리더만 가능)
     */
    @Transactional
    public void rejectRequest(Long requestId, Long leaderId, String rejectReason) {
        StudyRequest request = findRequestEntityById(requestId);
        Study study = request.getStudy();

        // 리더 권한 확인
        if (!study.getLeader().getId().equals(leaderId)) {
            throw new BusinessException(ErrorCode.NOT_STUDY_LEADER);
        }

        // 이미 처리된 신청인지 확인
        if (!request.isPending()) {
            throw new BusinessException(ErrorCode.REQUEST_ALREADY_PROCESSED);
        }

        request.reject(rejectReason);
    }

    /**
     * 가입 신청 취소 (신청자 본인만 가능)
     */
    @Transactional
    public void cancelRequest(Long requestId, Long userId) {
        StudyRequest request = findRequestEntityById(requestId);

        // 신청자 본인인지 확인
        if (!request.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.NOT_REQUEST_OWNER);
        }

        // 대기 중인 신청만 취소 가능
        if (!request.isPending()) {
            throw new BusinessException(ErrorCode.REQUEST_ALREADY_PROCESSED);
        }

        studyRequestRepository.delete(request);
    }

    /**
     * 스터디의 대기 중인 가입 신청 목록 (리더용)
     */
    public Page<StudyRequestResponse> findPendingRequestsByStudyId(Long studyId, Long leaderId, Pageable pageable) {
        Study study = studyService.findStudyEntityById(studyId);

        // 리더 권한 확인
        if (!study.getLeader().getId().equals(leaderId)) {
            throw new BusinessException(ErrorCode.NOT_STUDY_LEADER);
        }

        return studyRequestRepository.findByStudyAndStatus(study, RequestStatus.PENDING, pageable)
                .map(StudyRequestResponse::from);
    }

    /**
     * 사용자의 가입 신청 목록
     */
    public List<StudyRequestResponse> findRequestsByUserId(Long userId) {
        User user = userService.findUserEntityById(userId);
        return studyRequestRepository.findByUser(user)
                .stream()
                .map(StudyRequestResponse::from)
                .toList();
    }

    /**
     * 내부용: Entity 조회
     */
    private StudyRequest findRequestEntityById(Long requestId) {
        return studyRequestRepository.findById(requestId)
                .orElseThrow(() -> new BusinessException(ErrorCode.REQUEST_NOT_FOUND));
    }
}
