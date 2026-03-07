import { getAuthClient } from './client';
import { withErrorHandling } from './apiError';

// Types
export interface OnboardingData {
  termsAgreed: boolean;
  privacyAgreed: boolean;
  marketingAgreed: boolean;
  experience: string;
  interests: string[];
  studyStyles: string[];
  region: string;
  latitude: number | null;
  longitude: number | null;
  nickname: string;
  profileImage: string | null;
}

// Step 1: 약관 동의
export const agreeToTerms = async (
  termsAgreed: boolean,
  privacyAgreed: boolean,
  marketingAgreed: boolean
): Promise<void> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      await client.post('/api/onboarding/terms', {
        termsAgreed,
        privacyAgreed,
        marketingAgreed,
      });
    },
    { defaultMessage: '약관 동의 저장에 실패했습니다.' }
  );
};

// Step 2: 프로필 설정
export const setupProfile = async (
  nickname: string,
  profileImage?: string
): Promise<void> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      await client.post('/api/onboarding/profile', {
        nickname,
        profileImage,
      });
    },
    {
      defaultMessage: '프로필 설정에 실패했습니다.',
      errorMessages: {
        conflict: '이미 사용 중인 닉네임입니다.',
      },
    }
  );
};

// Step 3: 관심분야 설정
export const setInterests = async (interests: string[]): Promise<void> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      await client.post('/api/onboarding/interests', {
        interests,
      });
    },
    { defaultMessage: '관심분야 설정에 실패했습니다.' }
  );
};

// Step 4: 경험 수준 설정
export const setExperienceLevel = async (experienceLevel: string): Promise<void> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      await client.post('/api/onboarding/experience', {
        experienceLevel,
      });
    },
    { defaultMessage: '경험 수준 설정에 실패했습니다.' }
  );
};

// Step 5: 스터디 방식 선호 설정
export const setStudyPreferences = async (studyTypes: string[]): Promise<void> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      await client.post('/api/onboarding/study-preferences', {
        studyTypes,
      });
    },
    { defaultMessage: '스터디 방식 설정에 실패했습니다.' }
  );
};

// Step 6: 지역 설정
export const setRegion = async (
  region: string,
  latitude?: number | null,
  longitude?: number | null
): Promise<void> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      await client.post('/api/onboarding/region', {
        region,
        latitude,
        longitude,
      });
    },
    { defaultMessage: '지역 설정에 실패했습니다.' }
  );
};

// Step 7: 알림 설정 (default: 모두 false)
export const setNotificationSettings = async (
  pushNotificationEnabled: boolean = false,
  chatNotificationEnabled: boolean = false,
  studyNotificationEnabled: boolean = false
): Promise<void> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      await client.post('/api/onboarding/notifications', {
        pushNotificationEnabled,
        chatNotificationEnabled,
        studyNotificationEnabled,
      });
    },
    { defaultMessage: '알림 설정에 실패했습니다.' }
  );
};

// Step 8: 온보딩 완료
export const completeOnboarding = async (): Promise<void> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      await client.post('/api/onboarding/complete');
    },
    { defaultMessage: '온보딩 완료 처리에 실패했습니다.' }
  );
};

// 전체 온보딩 데이터 제출 (한번에 모든 API 호출)
export const submitAllOnboardingData = async (data: OnboardingData): Promise<void> => {
  // 1. 약관 동의
  await agreeToTerms(data.termsAgreed, data.privacyAgreed, data.marketingAgreed);

  // 2. 경험 수준 (스킵 가능)
  if (data.experience) {
    await setExperienceLevel(data.experience);
  }

  // 3. 관심분야 (스킵 가능)
  if (data.interests.length > 0) {
    await setInterests(data.interests);
  }

  // 4. 스터디 방식 (스킵 가능)
  if (data.studyStyles.length > 0) {
    await setStudyPreferences(data.studyStyles);
  }

  // 5. 지역 설정 (스킵 가능)
  if (data.region) {
    await setRegion(data.region, data.latitude, data.longitude);
  }

  // 6. 프로필 설정 (닉네임 필수, 프로필 이미지는 이미 업로드됨)
  await setupProfile(data.nickname, data.profileImage || undefined);

  // 7. 알림 설정 (기본값: 모두 꺼짐)
  await setNotificationSettings(false, false, false);

  // 8. 온보딩 완료
  await completeOnboarding();
};
