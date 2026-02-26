package com.wiedu.service.user;

import com.wiedu.domain.entity.Study;
import com.wiedu.domain.entity.User;
import com.wiedu.domain.enums.MemberRole;
import com.wiedu.domain.enums.MemberStatus;
import com.wiedu.domain.enums.StudyStatus;
import com.wiedu.dto.user.ActivityStatsResponse;
import com.wiedu.dto.user.MyProfileResponse;
import com.wiedu.repository.study.StudyMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProfileService {

    private static final BigDecimal UNLOCK_TEMPERATURE = BigDecimal.valueOf(40.0);

    private final UserService userService;
    private final StudyMemberRepository studyMemberRepository;

    /**
     * 현재 사용자 프로필 조회
     */
    public MyProfileResponse getMyProfile(Long userId) {
        User user = userService.findUserEntityById(userId);

        // 참여 중인 스터디 목록 (ACTIVE 멤버십)
        List<Study> activeStudies = studyMemberRepository
                .findByUserAndStatus(user, MemberStatus.ACTIVE)
                .stream()
                .map(sm -> sm.getStudy())
                .toList();

        // 참여 중인 스터디 수 (IN_PROGRESS 상태)
        int activeStudyCount = (int) activeStudies.stream()
                .filter(s -> s.getStatus() == StudyStatus.IN_PROGRESS)
                .count();

        // 완료한 스터디 수 (COMPLETED 상태)
        int completedStudyCount = (int) activeStudies.stream()
                .filter(s -> s.getStatus() == StudyStatus.COMPLETED)
                .count();

        // 운영 중인 스터디 수 (LEADER 역할 + ACTIVE 멤버십)
        List<Study> leadingStudies = studyMemberRepository
                .findStudiesByUserAndRole(user, MemberRole.LEADER, MemberStatus.ACTIVE);
        int leadingStudyCount = leadingStudies.size();

        // 출석률: 현재는 0으로 설정 (출석 기능 구현 시 업데이트)
        int attendanceRate = 0;

        ActivityStatsResponse stats = new ActivityStatsResponse(
                activeStudyCount,
                completedStudyCount,
                leadingStudyCount,
                attendanceRate
        );

        // 스터디장 해금 여부 (온도 >= 40)
        BigDecimal temperature = user.getTemperature() != null ? user.getTemperature() : BigDecimal.valueOf(36.5);
        boolean isStudyLeaderUnlocked = temperature.compareTo(UNLOCK_TEMPERATURE) >= 0;
        BigDecimal temperatureToUnlock = isStudyLeaderUnlocked
                ? BigDecimal.ZERO
                : UNLOCK_TEMPERATURE.subtract(temperature);

        String experienceLevel = user.getExperienceLevel() != null
                ? user.getExperienceLevel().name()
                : null;

        return new MyProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getProfileImage(),
                temperature,
                experienceLevel,
                user.getRegion(),
                user.isOnboardingCompleted(),
                stats,
                isStudyLeaderUnlocked,
                temperatureToUnlock
        );
    }
}
