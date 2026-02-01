package com.wiedu.service;

import com.wiedu.domain.entity.Study;
import com.wiedu.domain.entity.StudyMember;
import com.wiedu.domain.entity.User;
import com.wiedu.domain.enums.MemberStatus;
import com.wiedu.dto.response.StudyMemberResponse;
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
     * 스터디 멤버 목록 조회
     */
    public List<StudyMemberResponse> findMembersByStudyId(Long studyId) {
        Study study = studyService.findStudyEntityById(studyId);
        return studyMemberRepository.findByStudyAndStatus(study, MemberStatus.ACTIVE)
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
                .orElseThrow(() -> new IllegalArgumentException("스터디 멤버가 아닙니다."));

        // 리더는 탈퇴 불가 (스터디 마감 또는 리더 위임 필요)
        if (member.isLeader()) {
            throw new IllegalArgumentException("리더는 탈퇴할 수 없습니다. 스터디를 마감하거나 리더를 위임해주세요.");
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
            throw new IllegalArgumentException("멤버 강제 탈퇴 권한이 없습니다.");
        }

        // 자기 자신은 강제 탈퇴 불가
        if (leaderId.equals(targetUserId)) {
            throw new IllegalArgumentException("자기 자신은 강제 탈퇴할 수 없습니다.");
        }

        User targetUser = userService.findUserEntityById(targetUserId);
        StudyMember member = studyMemberRepository.findByStudyAndUser(study, targetUser)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자는 스터디 멤버가 아닙니다."));

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
            throw new IllegalArgumentException("리더 위임 권한이 없습니다.");
        }

        User currentLeader = userService.findUserEntityById(currentLeaderId);
        User newLeader = userService.findUserEntityById(newLeaderId);

        // 새 리더가 스터디 멤버인지 확인
        StudyMember newLeaderMember = studyMemberRepository.findByStudyAndUser(study, newLeader)
                .orElseThrow(() -> new IllegalArgumentException("새 리더는 스터디 멤버여야 합니다."));

        if (!newLeaderMember.isActive()) {
            throw new IllegalArgumentException("탈퇴한 멤버에게 리더를 위임할 수 없습니다.");
        }

        // 현재 리더의 역할 변경
        StudyMember currentLeaderMember = studyMemberRepository.findByStudyAndUser(study, currentLeader)
                .orElseThrow();

        // 역할 교체 (Entity에 demoteToMember 메서드 추가 필요하지만 일단 직접 처리)
        newLeaderMember.promoteToLeader();
        // TODO: currentLeaderMember의 role을 MEMBER로 변경하는 메서드 필요
    }
}
