export type RootStackParamList = {
  Splash: undefined;
  Onboarding: { userId?: number };
  Login: undefined;
  EmailLogin: undefined;
  Signup: undefined;
  EmailVerify: { email: string; password: string };
  Home: { email?: string } | undefined;
  StudySearch: undefined;
  CategoryStudies: {
    categoryId: number;
    categoryName: string;
  };
  StudyCreate: { studyId?: number } | undefined;
  StudyDetail: { studyId: number };
  StudyApply: {
    studyId: number;
    studyTitle: string;
    leaderName: string;
    currentMembers: number;
    maxMembers: number;
    rules: Array<{ ruleOrder: number; content: string }>;
    depositRefundPolicy?: string;
  };
  ApplyComplete: { studyId: number; studyTitle: string };
  BoardPostCreate: { studyId: number; isLeader?: boolean };
  BoardPostDetail: { studyId: number; postId: number };
  MyPage: undefined;
  StudyLeader: undefined;
  ProfileEdit: undefined;
  Settings: undefined;
  LocationSearch: {
    onSelect: (location: {
      address: string;
      addressDetail: string;
      region?: string;
      city?: string;
      district?: string;
      latitude: number;
      longitude: number;
    }) => void;
  };
  RegionPicker: {
    onSelect?: (location: {
      address: string;
      latitude: number;
      longitude: number;
    }) => void;
    initialRegion?: string; // 예: "서울특별시 강남구"
  };
  ReviewWrite: {
    studyId: number;
    studyTitle: string;
    leaderName: string;
    leaderProfileImage?: string;
  };
  MemberReview: {
    studyId: number;
    studyTitle: string;
  };
  ApplicantManagement: {
    studyId: number;
    studyTitle: string;
  };
  StudyMembers: {
    studyId: number;
    studyTitle: string;
  };
  StudyList: {
    type: 'nearby' | 'popular';
    title: string;
    location?: {
      latitude: number;
      longitude: number;
      displayName: string;
    };
  };
  Notifications: undefined;
  CurriculumEdit: {
    studyId: number;
    studyTitle: string;
  };
  SessionEdit: {
    curriculumId: number;
    weekNumber: number;
    sessionId?: number;
    sessionNumber: number;
    isNew: boolean;
  };
  StudyCalendar: {
    studyId: number;
    studyTitle: string;
    isLeader: boolean;
  };
  SessionAttendance: {
    sessionId: number;
    sessionTitle: string;
    studyId: number;
    isLeader: boolean;
  };
  BookmarkedStudies: undefined;
};
