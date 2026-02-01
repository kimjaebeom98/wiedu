package com.wiedu.service;

import com.wiedu.domain.entity.Study;
import com.wiedu.domain.entity.StudyMember;
import com.wiedu.domain.entity.StudyRequest;
import com.wiedu.domain.entity.User;
import com.wiedu.domain.enums.MemberRole;
import com.wiedu.domain.enums.MemberStatus;
import com.wiedu.domain.enums.RequestStatus;
import com.wiedu.dto.request.StudyJoinRequest;
import com.wiedu.dto.response.StudyRequestResponse;
import com.wiedu.repository.StudyMemberRepository;
import com.wiedu.repository.StudyRequestRepository;
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
            throw new IllegalArgumentException("모집 중인 스터디가 아닙니다.");
        }

        // 이미 멤버인지 확인
        if (studyMemberRepository.existsByStudyAndUserAndStatus(study, user, MemberStatus.ACTIVE)) {
            throw new IllegalArgumentException("이미 가입된 스터디입니다.");
        }

        // 이미 신청했는지 확인 (대기 중인 신청)
        if (studyRequestRepository.existsByStudyAndUserAndStatus(study, user, RequestStatus.PENDING)) {
            throw new IllegalArgumentException("이미 가입 신청한 스터디입니다.");
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
            throw new IllegalArgumentException("가입 신청 승인 권한이 없습니다.");
        }

        // 이미 처리된 신청인지 확인
        if (!request.isPending()) {
            throw new IllegalArgumentException("이미 처리된 신청입니다.");
        }

        // 정원 초과 확인
        if (study.isFull()) {
            throw new IllegalArgumentException("스터디 정원이 가득 찼습니다.");
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
            throw new IllegalArgumentException("가입 신청 거절 권한이 없습니다.");
        }

        // 이미 처리된 신청인지 확인
        if (!request.isPending()) {
            throw new IllegalArgumentException("이미 처리된 신청입니다.");
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
            throw new IllegalArgumentException("본인의 신청만 취소할 수 있습니다.");
        }

        // 대기 중인 신청만 취소 가능
        if (!request.isPending()) {
            throw new IllegalArgumentException("대기 중인 신청만 취소할 수 있습니다.");
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
            throw new IllegalArgumentException("신청 목록 조회 권한이 없습니다.");
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
                .orElseThrow(() -> new IllegalArgumentException("가입 신청을 찾을 수 없습니다: " + requestId));
    }
}
