import { getAuthClient } from './client';
import { withErrorHandling } from './apiError';

// ==================== Types ====================

export interface WithdrawalRequestResponse {
  id: number;
  studyId: number;
  studyTitle: string;
  userId: number;
  userNickname: string;
  userProfileImage?: string;
  reason: string;
  status: 'PENDING' | 'APPROVED';
  createdAt: string;
  processedAt?: string;
}

export interface WithdrawalRequestInput {
  reason: string;
}

// ==================== API Functions ====================

// POST /api/studies/:studyId/withdrawal-requests - Request withdrawal from study
export const requestWithdrawal = async (
  studyId: number,
  reason: string
): Promise<WithdrawalRequestResponse> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.post(`/api/studies/${studyId}/withdrawal-requests`, { reason });
      return response.data;
    },
    {
      defaultMessage: '탈퇴 신청에 실패했습니다.',
      errorMessages: {
        conflict: '이미 탈퇴 신청한 상태입니다.',
        forbidden: '스터디장은 탈퇴 신청을 할 수 없습니다.',
      },
    }
  );
};

// GET /api/studies/:studyId/withdrawal-requests - Get pending withdrawal requests (leader only)
export const getWithdrawalRequests = async (
  studyId: number
): Promise<WithdrawalRequestResponse[]> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get(`/api/studies/${studyId}/withdrawal-requests`);
      return response.data.content || response.data;
    },
    {
      defaultMessage: '탈퇴 신청 목록을 불러오는데 실패했습니다.',
      errorMessages: {
        forbidden: '스터디 리더만 조회할 수 있습니다.',
      },
    }
  );
};

// GET /api/studies/:studyId/withdrawal-requests/count - Get pending withdrawal request count (leader only)
export const getWithdrawalRequestCount = async (studyId: number): Promise<number> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get(`/api/studies/${studyId}/withdrawal-requests/count`);
      return response.data;
    },
    {
      defaultMessage: '탈퇴 신청 수를 불러오는데 실패했습니다.',
    }
  );
};

// GET /api/studies/:studyId/withdrawal-requests/me - Get my withdrawal request for a study
export const getMyWithdrawalRequest = async (
  studyId: number
): Promise<WithdrawalRequestResponse | null> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get(`/api/studies/${studyId}/withdrawal-requests/me`);
      // 204 No Content인 경우 null 반환
      if (response.status === 204 || !response.data) {
        return null;
      }
      return response.data;
    },
    {
      defaultMessage: '탈퇴 신청 정보를 불러오는데 실패했습니다.',
    }
  );
};

// POST /api/withdrawal-requests/:requestId/approve - Approve withdrawal request (leader only)
export const approveWithdrawalRequest = async (requestId: number): Promise<void> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      await client.post(`/api/withdrawal-requests/${requestId}/approve`);
    },
    {
      defaultMessage: '탈퇴 승인에 실패했습니다.',
      errorMessages: {
        forbidden: '스터디 리더만 승인할 수 있습니다.',
        notFound: '탈퇴 신청을 찾을 수 없습니다.',
      },
    }
  );
};

// DELETE /api/withdrawal-requests/:requestId - Cancel withdrawal request (self only)
export const cancelWithdrawalRequest = async (requestId: number): Promise<void> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      await client.delete(`/api/withdrawal-requests/${requestId}`);
    },
    {
      defaultMessage: '탈퇴 신청 취소에 실패했습니다.',
      errorMessages: {
        forbidden: '본인의 탈퇴 신청만 취소할 수 있습니다.',
      },
    }
  );
};
