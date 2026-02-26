package com.wiedu.service.user;

import com.wiedu.domain.entity.StudyMember;
import com.wiedu.domain.entity.User;
import com.wiedu.domain.enums.MemberRole;
import com.wiedu.domain.enums.MemberStatus;
import com.wiedu.domain.enums.StudyStatus;
import com.wiedu.dto.user.MyStudyResponse;
import com.wiedu.repository.study.StudyMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Stream;

/**
 * 내 스터디 목록 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MyStudiesService {

    private final UserService userService;
    private final StudyMemberRepository studyMemberRepository;

    /**
     * 내 스터디 목록 조회
     *
     * @param userId 현재 사용자 ID
     * @param status 스터디 상태 필터 (ACTIVE=진행중, COMPLETED=완료, null=전체)
     * @param role   역할 필터 (LEADER=운영, MEMBER=참여, null=전체)
     */
    public List<MyStudyResponse> getMyStudies(Long userId, String status, String role) {
        User user = userService.findUserEntityById(userId);

        // 활성 멤버십만 조회
        List<StudyMember> memberships = studyMemberRepository.findByUserAndStatus(user, MemberStatus.ACTIVE);

        Stream<StudyMember> stream = memberships.stream();

        // 스터디 상태 필터
        if (status != null && !status.isBlank()) {
            StudyStatus studyStatus = mapToStudyStatus(status.toUpperCase());
            if (studyStatus != null) {
                stream = stream.filter(sm -> studyStatus == sm.getStudy().getStatus());
            }
        }

        // 역할 필터
        if (role != null && !role.isBlank()) {
            try {
                MemberRole memberRole = MemberRole.valueOf(role.toUpperCase());
                stream = stream.filter(sm -> memberRole == sm.getRole());
            } catch (IllegalArgumentException ignored) {
                // 잘못된 role 값은 필터 무시
            }
        }

        return stream.map(MyStudyResponse::from).toList();
    }

    /**
     * 쿼리 파라미터 status 값을 StudyStatus로 변환
     * ACTIVE → IN_PROGRESS (진행중)
     * COMPLETED → COMPLETED (완료)
     * 그 외 → null (필터 없음)
     */
    private StudyStatus mapToStudyStatus(String status) {
        return switch (status) {
            case "ACTIVE" -> StudyStatus.IN_PROGRESS;
            case "COMPLETED" -> StudyStatus.COMPLETED;
            default -> null;
        };
    }
}
