package com.wiedu.service.user;

import com.wiedu.domain.entity.Study;
import com.wiedu.domain.entity.User;
import com.wiedu.domain.entity.UserInterest;
import com.wiedu.domain.enums.InterestType;
import com.wiedu.domain.enums.MemberRole;
import com.wiedu.domain.enums.MemberStatus;
import com.wiedu.domain.enums.StudyStatus;
import com.wiedu.dto.user.ActivityStatsResponse;
import com.wiedu.dto.user.MyProfileResponse;
import com.wiedu.dto.user.ProfileUpdateRequest;
import com.wiedu.repository.study.StudyMemberRepository;
import com.wiedu.repository.user.UserInterestRepository;
import com.wiedu.repository.user.UserRepository;
import com.wiedu.service.file.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProfileService {

    private static final BigDecimal UNLOCK_TEMPERATURE = BigDecimal.valueOf(40.0);

    private final UserService userService;
    private final UserRepository userRepository;
    private final UserInterestRepository userInterestRepository;
    private final StudyMemberRepository studyMemberRepository;
    private final FileStorageService fileStorageService;

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

        // 관심분야 조회
        List<String> interests = userInterestRepository.findByUser(user)
                .stream()
                .map(ui -> ui.getInterestType().name())
                .toList();

        return new MyProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getProfileImage(),
                user.getBio(),
                temperature,
                experienceLevel,
                user.getRegion(),
                interests,
                user.isOnboardingCompleted(),
                stats,
                isStudyLeaderUnlocked,
                temperatureToUnlock
        );
    }

    /**
     * 프로필 수정
     */
    @Transactional
    public void updateProfile(Long userId, ProfileUpdateRequest request) {
        User user = userService.findUserEntityById(userId);

        if (request.nickname() != null && !request.nickname().isBlank()) {
            // 닉네임 중복 검사 (자신 제외)
            if (!user.getNickname().equals(request.nickname()) &&
                userRepository.existsByNickname(request.nickname())) {
                throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
            }
            user.updateNickname(request.nickname());
        }

        if (request.bio() != null) {
            user.updateBio(request.bio());
        }

        if (request.region() != null) {
            // 빈 문자열이면 지역 삭제, 아니면 좌표와 함께 업데이트
            if (request.region().isBlank()) {
                user.updateLocation(null, null, null);
            } else {
                user.updateLocation(request.region(), request.latitude(), request.longitude());
            }
        }

        // 관심분야 업데이트
        if (request.interests() != null) {
            // 기존 관심분야 삭제
            userInterestRepository.deleteAllByUser(user);

            // 새 관심분야 저장
            for (String interest : request.interests()) {
                try {
                    InterestType interestType = InterestType.valueOf(interest);
                    UserInterest userInterest = UserInterest.create(user, interestType);
                    userInterestRepository.save(userInterest);
                } catch (IllegalArgumentException e) {
                    log.warn("유효하지 않은 관심분야: {}", interest);
                }
            }
        }

        userRepository.save(user);
    }

    /**
     * 프로필 이미지 업로드
     */
    @Transactional
    public String updateProfileImage(Long userId, MultipartFile file) throws IOException {
        User user = userService.findUserEntityById(userId);

        // 기존 이미지가 있으면 삭제
        if (user.getProfileImage() != null && !user.getProfileImage().isEmpty()) {
            try {
                fileStorageService.delete(user.getProfileImage());
            } catch (Exception e) {
                log.warn("기존 프로필 이미지 삭제 실패: {}", e.getMessage());
            }
        }

        // 새 이미지 저장
        String imageUrl = fileStorageService.store(file, "profile");
        user.updateProfileImage(imageUrl);
        userRepository.save(user);

        return imageUrl;
    }
}
