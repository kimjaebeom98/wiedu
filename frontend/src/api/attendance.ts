import { getAuthClient } from './client';
import { withErrorHandling } from './apiError';
import {
  AttendanceRequest,
  AttendanceApprovalRequest,
  AttendanceResponse,
  AttendanceSummaryResponse,
} from '../types/attendance';

/**
 * 회차 참석 현황 조회
 */
export const getAttendanceSummary = async (
  sessionId: number
): Promise<AttendanceSummaryResponse> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get(`/api/sessions/${sessionId}/attendances`);
      return response.data;
    },
    { defaultMessage: '참석 현황을 불러오는데 실패했습니다.' }
  );
};

/**
 * 내 참석 응답 조회
 */
export const getMyAttendance = async (
  sessionId: number
): Promise<AttendanceResponse | null> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get(`/api/sessions/${sessionId}/attendances/me`);
      // 204 No Content인 경우 null 반환
      if (response.status === 204) {
        return null;
      }
      return response.data;
    },
    { defaultMessage: '내 참석 정보를 불러오는데 실패했습니다.' }
  );
};

/**
 * 참석/불참 응답
 */
export const respondAttendance = async (
  sessionId: number,
  request: AttendanceRequest
): Promise<AttendanceResponse> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.post(`/api/sessions/${sessionId}/attendances`, request);
      return response.data;
    },
    {
      defaultMessage: '참석 응답에 실패했습니다.',
      errorMessages: {
        forbidden: '스터디 멤버만 참석 응답을 할 수 있습니다.',
      },
    }
  );
};

/**
 * 불참 승인/거절 (스터디장)
 */
export const processAbsence = async (
  attendanceId: number,
  request: AttendanceApprovalRequest
): Promise<AttendanceResponse> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.patch(`/api/attendances/${attendanceId}/process`, request);
      return response.data;
    },
    {
      defaultMessage: '불참 처리에 실패했습니다.',
      errorMessages: {
        forbidden: '스터디장만 불참을 승인/거절할 수 있습니다.',
      },
    }
  );
};

/**
 * 승인 대기 불참 목록 (스터디장)
 */
export const getPendingAbsences = async (
  studyId: number
): Promise<AttendanceResponse[]> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get(`/api/studies/${studyId}/attendances/pending`);
      return response.data;
    },
    { defaultMessage: '승인 대기 목록을 불러오는데 실패했습니다.' }
  );
};

/**
 * 특정 날짜의 참석 현황 (캘린더)
 */
export const getAttendancesByDate = async (
  studyId: number,
  date: string // YYYY-MM-DD format
): Promise<AttendanceSummaryResponse[]> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get(`/api/studies/${studyId}/attendances/by-date`, {
        params: { date },
      });
      return response.data;
    },
    { defaultMessage: '해당 날짜의 참석 현황을 불러오는데 실패했습니다.' }
  );
};

/**
 * 월별 회차 날짜 목록 (캘린더)
 */
export const getSessionDatesInMonth = async (
  studyId: number,
  year: number,
  month: number
): Promise<string[]> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get(`/api/studies/${studyId}/sessions/dates`, {
        params: { year, month },
      });
      return response.data;
    },
    { defaultMessage: '회차 날짜 목록을 불러오는데 실패했습니다.' }
  );
};

/**
 * 회차 취소 (스터디장)
 */
export const cancelSession = async (
  sessionId: number,
  reason: string
): Promise<void> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      await client.post(`/api/sessions/${sessionId}/cancel`, { reason });
    },
    {
      defaultMessage: '회차 취소에 실패했습니다.',
      errorMessages: {
        forbidden: '스터디장만 회차를 취소할 수 있습니다.',
      },
    }
  );
};
