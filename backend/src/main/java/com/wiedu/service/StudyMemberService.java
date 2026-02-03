package com.wiedu.service;

import com.wiedu.domain.entity.Study;
import com.wiedu.domain.entity.StudyMember;
import com.wiedu.domain.entity.User;
import com.wiedu.domain.enums.MemberStatus;
import com.wiedu.dto.response.StudyMemberResponse;
import com.wiedu.exception.BusinessException;
import com.wiedu.exception.ErrorCode;
import com.wiedu.repository.StudyMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 스터디 멤버 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyMemberService {

    private final StudyMemberRepository studyMemberRepository;
    private final StudyService studyService;
    private final UserService userService;

    /**
     * 스터디 멤버 목록 조회 (N+1 방지)
     */
    public List<StudyMemberResponse> findMembersByStudyId(Long studyId) {
        Study study = studyService.findStudyEntityById(studyId);
        return studyMemberRepository.findByStudyAndStatusWithUser(study, MemberStatus.ACTIVE)
                .stream()
                .map(StudyMemberResponse::from)
                .toList();
    }

    /**
     * 사용자가 가입한 스터디 멤버십 목록
     */
    public List<StudyMemberResponse> findMembershipsByUserId(Long userId) {
        User user = userService.findUserEntityById(userId);
        return studyMemberRepository.findByUserAndStatus(user, MemberStatus.ACTIVE)
                .stream()
                .map(StudyMemberResponse::from)
                .toList();
    }

    /**
     * 특정 스터디의 멤버 여부 확인
     */
    public boolean isMemberOfStudy(Long studyId, Long userId) {
        Study study = studyService.findStudyEntityById(studyId);
        User user = userService.findUserEntityById(userId);
        return studyMemberRepository.existsByStudyAndUserAndStatus(study, user, MemberStatus.ACTIVE);
    }

    /**
     * 멤버 탈퇴
     */
    @Transactional
    public void withdrawFromStudy(Long studyId, Long userId) {
        Study study = studyService.findStudyEntityById(studyId);
        User user = userService.findUserEntityById(userId);

        StudyMember member = studyMemberRepository.findByStudyAndUser(study, user)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_MEMBER));

        // 리더는 탈퇴 불가 (스터디 마감 또는 리더 위임 필요)
        if (member.isLeader()) {
            throw new BusinessException(ErrorCode.LEADER_CANNOT_WITHDRAW);
        }

        member.withdraw();
        study.decrementMember();
    }

    /**
     * 멤버 강제 탈퇴 (리더만 가능)
     */
    @Transactional
    public void kickMember(Long studyId, Long leaderId, Long targetUserId) {
        Study study = studyService.findStudyEntityById(studyId);

        // 리더 권한 확인
        if (!study.getLeader().getId().equals(leaderId)) {
            throw new BusinessException(ErrorCode.NOT_STUDY_LEADER);
        }

        // 자기 자신은 강제 탈퇴 불가
        if (leaderId.equals(targetUserId)) {
            throw new BusinessException(ErrorCode.CANNOT_KICK_SELF);
        }

        User targetUser = userService.findUserEntityById(targetUserId);
        StudyMember member = studyMemberRepository.findByStudyAndUser(study, targetUser)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_MEMBER));

        member.withdraw();
        study.decrementMember();
    }

    /**
     * 리더 위임
     */
    @Transactional
    public void delegateLeader(Long studyId, Long currentLeaderId, Long newLeaderId) {
        Study study = studyService.findStudyEntityById(studyId);

        // 현재 리더 권한 확인
        if (!study.getLeader().getId().equals(currentLeaderId)) {
            throw new BusinessException(ErrorCode.NOT_STUDY_LEADER);
        }

        User currentLeader = userService.findUserEntityById(currentLeaderId);
        User newLeader = userService.findUserEntityById(newLeaderId);

        // 새 리더가 스터디 멤버인지 확인
        StudyMember newLeaderMember = studyMemberRepository.findByStudyAndUser(study, newLeader)
                .orElseThrow(() -> new BusinessException(ErrorCode.NEW_LEADER_MUST_BE_MEMBER));

        if (!newLeaderMember.isActive()) {
            throw new BusinessException(ErrorCode.CANNOT_DELEGATE_TO_WITHDRAWN);
        }

        // 현재 리더의 멤버 정보 조회
        StudyMember currentLeaderMember = studyMemberRepository.findByStudyAndUser(study, currentLeader)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_MEMBER));

        // 역할 교체
        currentLeaderMember.demoteToMember();
        newLeaderMember.promoteToLeader();

        // Study의 leader 필드도 업데이트
        study.changeLeader(newLeader);
    }
}
