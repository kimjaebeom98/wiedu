export interface ActivityStats {
  activeStudyCount: number;
  completedStudyCount: number;
  leadingStudyCount: number;
  attendanceRate: number;
}

export interface MyProfile {
  id: number;
  email: string;
  nickname: string;
  profileImage: string | null;
  bio: string | null;
  temperature: number;
  experienceLevel: string | null;
  region: string | null;
  interests: string[];
  onboardingCompleted: boolean;
  stats: ActivityStats;
  isStudyLeaderUnlocked: boolean;
  temperatureToUnlock: number;
}
