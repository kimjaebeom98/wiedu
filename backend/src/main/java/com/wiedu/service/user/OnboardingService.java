package com.wiedu.service.user;

import com.wiedu.domain.entity.User;
import com.wiedu.domain.entity.UserInterest;
import com.wiedu.domain.entity.UserStudyPreference;
import com.wiedu.domain.enums.InterestType;
import com.wiedu.domain.enums.StudyType;
import com.wiedu.dto.onboarding.*;
import com.wiedu.exception.BusinessException;
import com.wiedu.exception.ErrorCode;
import com.wiedu.repository.user.UserInterestRepository;
import com.wiedu.repository.user.UserRepository;
import com.wiedu.repository.user.UserStudyPreferenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OnboardingService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final UserInterestRepository userInterestRepository;
    private final UserStudyPreferenceRepository userStudyPreferenceRepository;

    /**
     * Step 1: 약관 동의
     */
    @Transactional
    public void agreeToTerms(Long userId, TermsAgreementRequest request) {
        if (!request.getTermsAgreed() || !request.getPrivacyAgreed()) {
            throw new BusinessException(ErrorCode.TERMS_NOT_AGREED);
        }

        User user = userService.findUserEntityById(userId);
        user.agreeToTerms(request.getMarketingAgreed() != null && request.getMarketingAgreed());
    }

    /**
     * Step 2: 프로필 설정
     */
    @Transactional
    public void setupProfile(Long userId, ProfileSetupRequest request) {
        User user = userService.findUserEntityById(userId);

        // 닉네임 중복 체크 (자신 제외)
        if (userRepository.existsByNicknameAndIdNot(request.getNickname(), userId)) {
            throw new BusinessException(ErrorCode.NICKNAME_DUPLICATED);
        }

        user.updateProfile(request.getNickname(), request.getProfileImage());
    }

    /**
     * Step 3: 관심분야 설정
     */
    @Transactional
    public void setInterests(Long userId, InterestsRequest request) {
        User user = userService.findUserEntityById(userId);

        // 기존 관심분야 삭제
        userInterestRepository.deleteAllByUser(user);

        // 새 관심분야 저장
        if (request.getInterests() != null && !request.getInterests().isEmpty()) {
            List<UserInterest> interests = request.getInterests().stream()
                    .map(type -> UserInterest.create(user, type))
                    .collect(Collectors.toList());
            userInterestRepository.saveAll(interests);
        }
    }

    /**
     * Step 4: 경험 수준 설정
     */
    @Transactional
    public void setExperienceLevel(Long userId, ExperienceLevelRequest request) {
        User user = userService.findUserEntityById(userId);
        user.updateExperienceLevel(request.getExperienceLevel());
    }

    /**
     * Step 5: 스터디 방식 선호 설정
     */
    @Transactional
    public void setStudyPreferences(Long userId, StudyPreferencesRequest request) {
        User user = userService.findUserEntityById(userId);

        // 기존 선호 삭제
        userStudyPreferenceRepository.deleteAllByUser(user);

        // 새 선호 저장
        if (request.getStudyTypes() != null && !request.getStudyTypes().isEmpty()) {
            List<UserStudyPreference> preferences = request.getStudyTypes().stream()
                    .map(type -> UserStudyPreference.create(user, type))
                    .collect(Collectors.toList());
            userStudyPreferenceRepository.saveAll(preferences);
        }
    }

    /**
     * Step 6: 지역 설정
     */
    @Transactional
    public void setRegion(Long userId, RegionRequest request) {
        User user = userService.findUserEntityById(userId);
        user.updateLocation(request.getRegion(), request.getLatitude(), request.getLongitude());
    }

    /**
     * Step 7: 알림 설정
     */
    @Transactional
    public void setNotificationSettings(Long userId, NotificationSettingsRequest request) {
        User user = userService.findUserEntityById(userId);
        user.updateNotificationSettings(
                request.getPushNotificationEnabled() != null && request.getPushNotificationEnabled(),
                request.getChatNotificationEnabled() != null && request.getChatNotificationEnabled(),
                request.getStudyNotificationEnabled() != null && request.getStudyNotificationEnabled()
        );
    }

    /**
     * Step 8: 온보딩 완료
     */
    @Transactional
    public void completeOnboarding(Long userId) {
        User user = userService.findUserEntityById(userId);
        user.completeOnboarding();
    }

    /**
     * 온보딩 상태 조회
     */
    public OnboardingStatusResponse getOnboardingStatus(Long userId) {
        User user = userService.findUserEntityById(userId);

        List<InterestType> interests = userInterestRepository.findByUserId(userId).stream()
                .map(UserInterest::getInterestType)
                .collect(Collectors.toList());

        List<StudyType> studyPreferences = userStudyPreferenceRepository.findByUserId(userId).stream()
                .map(UserStudyPreference::getStudyType)
                .collect(Collectors.toList());

        int currentStep = calculateCurrentStep(user, interests, studyPreferences);

        return OnboardingStatusResponse.builder()
                .termsAgreed(user.getTermsAgreedAt() != null)
                .profileSet(user.getNickname() != null && !user.getNickname().isEmpty())
                .interests(interests)
                .experienceLevel(user.getExperienceLevel())
                .studyPreferences(studyPreferences)
                .region(user.getRegion())
                .pushNotificationEnabled(user.isPushNotificationEnabled())
                .chatNotificationEnabled(user.isChatNotificationEnabled())
                .studyNotificationEnabled(user.isStudyNotificationEnabled())
                .onboardingCompleted(user.isOnboardingCompleted())
                .currentStep(currentStep)
                .build();
    }

    private int calculateCurrentStep(User user, List<InterestType> interests, List<StudyType> studyPreferences) {
        if (user.isOnboardingCompleted()) return 8;
        if (user.getRegion() != null) return 7;
        if (!studyPreferences.isEmpty()) return 6;
        if (user.getExperienceLevel() != null) return 5;
        if (!interests.isEmpty()) return 4;
        if (user.getNickname() != null && !user.getNickname().isEmpty()) return 3;
        if (user.getTermsAgreedAt() != null) return 2;
        return 1;
    }
}
