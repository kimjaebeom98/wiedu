import axios from 'axios';
import { getBaseURL } from '../config/api';
import { getAccessToken } from '../storage/token';

// Authenticated API client
const createAuthClient = async () => {
  const token = await getAccessToken();
  return axios.create({
    baseURL: getBaseURL(),
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};

// Types
export interface OnboardingData {
  termsAgreed: boolean;
  privacyAgreed: boolean;
  marketingAgreed: boolean;
  experience: string;
  interests: string[];
  studyStyles: string[];
  region: string;
  nickname: string;
}

// Step 1: 약관 동의
export const agreeToTerms = async (
  termsAgreed: boolean,
  privacyAgreed: boolean,
  marketingAgreed: boolean
): Promise<void> => {
  const client = await createAuthClient();
  await client.post('/api/onboarding/terms', {
    termsAgreed,
    privacyAgreed,
    marketingAgreed,
  });
};

// Step 2: 프로필 설정
export const setupProfile = async (
  nickname: string,
  profileImage?: string
): Promise<void> => {
  const client = await createAuthClient();
  await client.post('/api/onboarding/profile', {
    nickname,
    profileImage,
  });
};

// Step 3: 관심분야 설정
export const setInterests = async (interests: string[]): Promise<void> => {
  const client = await createAuthClient();
  await client.post('/api/onboarding/interests', {
    interests,
  });
};

// Step 4: 경험 수준 설정
export const setExperienceLevel = async (experienceLevel: string): Promise<void> => {
  const client = await createAuthClient();
  await client.post('/api/onboarding/experience', {
    experienceLevel,
  });
};

// Step 5: 스터디 방식 선호 설정
export const setStudyPreferences = async (studyTypes: string[]): Promise<void> => {
  const client = await createAuthClient();
  await client.post('/api/onboarding/study-preferences', {
    studyTypes,
  });
};

// Step 6: 지역 설정
export const setRegion = async (region: string): Promise<void> => {
  const client = await createAuthClient();
  await client.post('/api/onboarding/region', {
    region,
  });
};

// Step 7: 알림 설정 (default: 모두 false)
export const setNotificationSettings = async (
  pushNotificationEnabled: boolean = false,
  chatNotificationEnabled: boolean = false,
  studyNotificationEnabled: boolean = false
): Promise<void> => {
  const client = await createAuthClient();
  await client.post('/api/onboarding/notifications', {
    pushNotificationEnabled,
    chatNotificationEnabled,
    studyNotificationEnabled,
  });
};

// Step 8: 온보딩 완료
export const completeOnboarding = async (): Promise<void> => {
  const client = await createAuthClient();
  await client.post('/api/onboarding/complete');
};

// 전체 온보딩 데이터 제출 (한번에 모든 API 호출)
export const submitAllOnboardingData = async (data: OnboardingData): Promise<void> => {
  try {
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
      await setRegion(data.region);
    }

    // 6. 프로필 설정 (닉네임 필수)
    await setupProfile(data.nickname);

    // 7. 알림 설정 (기본값: 모두 꺼짐)
    await setNotificationSettings(false, false, false);

    // 8. 온보딩 완료
    await completeOnboarding();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message;
      throw new Error(message || '온보딩 저장에 실패했습니다.');
    }
    throw error;
  }
};
