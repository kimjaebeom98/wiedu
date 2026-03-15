/**
 * 참석 상태
 */
export type AttendanceStatus =
  | 'ATTENDING'        // 참석
  | 'PENDING_ABSENCE'  // 불참 승인 대기
  | 'APPROVED_ABSENCE' // 불참 승인됨
  | 'REJECTED_ABSENCE'; // 불참 거절됨

/**
 * 참석 응답 요청
 */
export interface AttendanceRequest {
  attending: boolean;
  absenceReason?: string;
}

/**
 * 불참 승인/거절 요청
 */
export interface AttendanceApprovalRequest {
  approved: boolean;
  comment?: string;
}

/**
 * 참석 응답
 */
export interface AttendanceResponse {
  id: number;
  sessionId: number;
  userId: number;
  userNickname: string;
  userProfileImage: string | null;
  status: AttendanceStatus;
  absenceReason: string | null;
  respondedAt: string;
  approvedById: number | null;
  approvedByNickname: string | null;
  approvedAt: string | null;
  approvalComment: string | null;
}

/**
 * 참석 현황 요약
 */
export interface AttendanceSummaryResponse {
  sessionId: number;
  totalMembers: number;
  attendingCount: number;
  pendingAbsenceCount: number;
  approvedAbsenceCount: number;
  notRespondedCount: number;
  attendances: AttendanceResponse[];
}
