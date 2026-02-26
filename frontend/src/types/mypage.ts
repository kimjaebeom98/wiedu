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
  temperature: number;
  experienceLevel: string | null;
  region: string | null;
  onboardingCompleted: boolean;
  stats: ActivityStats;
  isStudyLeaderUnlocked: boolean;
  temperatureToUnlock: number;
}

export interface MyStudy {
  studyId: number;
  title: string;
  category: string | null;
  thumbnailImage: string | null;
  status: 'RECRUITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  myRole: 'LEADER' | 'MEMBER';
  currentMembers: number;
  maxMembers: number;
  startDate: string | null;
  endDate: string | null;
}
