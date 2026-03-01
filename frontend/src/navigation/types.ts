export type RootStackParamList = {
  Splash: undefined;
  Onboarding: { userId?: number };
  Login: undefined;
  EmailLogin: undefined;
  Signup: undefined;
  EmailVerify: { email: string; password: string };
  Home: { email?: string } | undefined;
  StudyCreate: undefined;
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
  LocationPicker: {
    onSelect?: (location: { address: string; addressDetail: string; latitude: number; longitude: number }) => void;
    initialLocation?: { latitude: number; longitude: number };
    eventName?: string; // If provided, emit event instead of calling onSelect
  };
  LocationSearch: {
    onSelect: (location: { address: string; addressDetail: string; latitude: number; longitude: number }) => void;
  };
};
