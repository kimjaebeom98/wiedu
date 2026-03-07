/**
 * 스터디 신청 상태 상수
 * - 백엔드에서 받은 상태값을 UI 표시용으로 매핑
 */

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export const APPLICATION_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: '대기중',
  APPROVED: '승인됨',
  REJECTED: '거절됨',
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  PENDING: '#F59E0B',
  APPROVED: '#22C55E',
  REJECTED: '#EF4444',
};

/**
 * 스터디 상태 상수
 */
export type StudyStatus = 'RECRUITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED';

export const STUDY_STATUS = {
  RECRUITING: 'RECRUITING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CLOSED: 'CLOSED',
} as const;

export const STUDY_STATUS_LABELS: Record<StudyStatus, string> = {
  RECRUITING: '모집중',
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
  CLOSED: '마감',
};

export const STUDY_STATUS_COLORS: Record<StudyStatus, string> = {
  RECRUITING: '#22C55E',
  IN_PROGRESS: '#3B82F6',
  COMPLETED: '#8B5CF6',
  CLOSED: '#71717A',
};
