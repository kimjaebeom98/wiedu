// Enums matching backend
export type StudyMethod = 'ONLINE' | 'OFFLINE' | 'HYBRID';
export type DurationType =
  | 'ONE_WEEK'
  | 'TWO_WEEKS'
  | 'THREE_WEEKS'
  | 'FOUR_WEEKS'
  | 'FIVE_WEEKS'
  | 'SIX_WEEKS'
  | 'EIGHT_WEEKS'
  | 'TEN_WEEKS'
  | 'TWELVE_WEEKS'
  | 'SIXTEEN_WEEKS'
  | 'TWENTY_WEEKS'
  | 'TWENTY_FOUR_WEEKS'
  | 'LONG_TERM';
export type StudyStatus = 'RECRUITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED';

export interface Category {
  id: number;
  code: string;
  name: string;
  icon: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: number;
  code: string;
  name: string;
}

export interface CurriculumItem {
  weekNumber: number;
  title: string;
  content: string;
}

export interface RuleItem {
  ruleOrder: number;
  content: string;
}

// Local state shape for the 6-step form
export interface StudyCreateData {
  // Step 1
  title: string;
  categoryId: number | null;
  subcategoryId: number | null;
  coverImageUrl: string;
  tags: string[];
  // Step 2
  description: string;
  targetAudience: string;
  goals: string;
  // Step 3
  studyMethod: StudyMethod | null;
  daysOfWeek: string[];
  time: string;
  durationType: DurationType | null;
  platform: string;
  meetingLocation: string;
  meetingLatitude: number | null;
  meetingLongitude: number | null;
  // Step 4
  maxMembers: number;
  deposit: number;
  depositRefundPolicy: string;
  requirements: string;
  // Step 5
  curriculums: CurriculumItem[];
  rules: RuleItem[];
}

// API request (sent to backend)
export interface StudyCreateRequest {
  title: string;
  categoryId: number;
  subcategoryId?: number;
  coverImageUrl?: string;
  tags?: string[];
  description: string;
  targetAudience?: string;
  goals?: string;
  studyMethod: StudyMethod;
  daysOfWeek?: string[];
  time?: string;
  durationType?: DurationType;
  platform?: string;
  meetingLocation?: string;
  meetingLatitude?: number;
  meetingLongitude?: number;
  maxMembers: number;
  deposit?: number;
  depositRefundPolicy?: string;
  requirements?: string;
  curriculums?: CurriculumItem[];
  rules?: RuleItem[];
  startDate?: string;
  endDate?: string;
}

export interface LeaderInfo {
  id: number;
  email: string;
  nickname: string;
  profileImage?: string;
  temperature: number;
  status: string;
  emailVerified: boolean;
  lastLoginAt: string;
  createdAt: string;
}

// Full study detail response from GET /api/studies/:id
export interface StudyDetailResponse {
  id: number;
  title: string;
  description: string;
  categoryName: string;
  subcategoryName?: string;
  coverImageUrl?: string;
  tags: string[];
  targetAudience?: string;
  goals?: string;
  leader: LeaderInfo;
  maxMembers: number;
  currentMembers: number;
  status: StudyStatus;
  studyMethod: StudyMethod;
  platform?: string;
  daysOfWeek?: string;
  time?: string;
  durationType?: DurationType;
  deposit?: number;
  depositRefundPolicy?: string;
  requirements?: string;
  curriculums: CurriculumItem[];
  rules: RuleItem[];
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

// Study response from API (full detail)
export interface StudyResponse {
  id: number;
  title: string;
  description: string;
  categoryName: string;
  subcategoryName?: string;
  coverImageUrl?: string;
  tags: string[];
  studyMethod: StudyMethod;
  maxMembers: number;
  currentMembers: number;
  status: StudyStatus;
  createdAt: string;
}

// Study list response from API (lightweight)
export interface StudyListResponse {
  id: number;
  title: string;
  categoryName: string;
  leaderNickname: string;
  maxMembers: number;
  currentMembers: number;
  status: StudyStatus;
  studyMethod: string;
  createdAt: string;
}
