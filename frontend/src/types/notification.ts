export type NotificationType =
  | 'STUDY_APPROVED'
  | 'STUDY_REJECTED'
  | 'STUDY_COMPLETED'
  | 'NEW_APPLICANT'
  | 'REVIEW_REQUEST'
  | 'NEW_REVIEW'
  | 'ABSENCE_REQUEST'
  | 'ABSENCE_APPROVED'
  | 'ABSENCE_REJECTED';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  targetId: number | null;
  targetType: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPage {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface UnreadCountResponse {
  count: number;
}

// 알림 타입별 아이콘 및 색상 매핑
export const NOTIFICATION_STYLES: Record<NotificationType, {
  icon: string;
  color: string;
  bgColor: string;
}> = {
  NEW_APPLICANT: {
    icon: 'user-plus',
    color: '#8B5CF6',
    bgColor: '#8B5CF620',
  },
  STUDY_APPROVED: {
    icon: 'check',
    color: '#22C55E',
    bgColor: '#22C55E20',
  },
  STUDY_REJECTED: {
    icon: 'x',
    color: '#EF4444',
    bgColor: '#EF444420',
  },
  STUDY_COMPLETED: {
    icon: 'calendar',
    color: '#F59E0B',
    bgColor: '#F59E0B20',
  },
  REVIEW_REQUEST: {
    icon: 'star',
    color: '#F59E0B',
    bgColor: '#F59E0B20',
  },
  NEW_REVIEW: {
    icon: 'message-circle',
    color: '#6366F1',
    bgColor: '#6366F120',
  },
  ABSENCE_REQUEST: {
    icon: 'user-minus',
    color: '#F59E0B',
    bgColor: '#F59E0B20',
  },
  ABSENCE_APPROVED: {
    icon: 'check-circle',
    color: '#22C55E',
    bgColor: '#22C55E20',
  },
  ABSENCE_REJECTED: {
    icon: 'x-circle',
    color: '#EF4444',
    bgColor: '#EF444420',
  },
};
