export interface OnboardingScreenProps {
  navigation: any;
  route: any;
}

export interface OnboardingData {
  // Step 1: Terms
  termsAgreed: boolean;
  privacyAgreed: boolean;
  marketingAgreed: boolean;
  // Step 2: Experience
  experience: string;
  // Step 3: Interests
  interests: string[];
  // Step 4: Study style
  studyStyles: string[];
  // Step 5: Region
  region: string;
  latitude: number | null;
  longitude: number | null;
  // Step 6: Profile
  nickname: string;
}

export interface StepProps {
  data: OnboardingData;
  updateData: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
}

export interface StepArrayProps {
  data: OnboardingData;
  toggleArrayItem: (key: 'interests' | 'studyStyles', item: string) => void;
}
