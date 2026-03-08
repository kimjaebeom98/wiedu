import { getAuthClient, getPublicClient } from './client';
import { withErrorHandling } from './apiError';
import { Category, StudyCreateRequest, StudyResponse, StudyDetailResponse, StudyListResponse } from '../types/study';

// GET /api/study-categories (no auth needed)
export const fetchCategories = async (): Promise<Category[]> => {
  return withErrorHandling(
    async () => {
      const client = getPublicClient();
      const response = await client.get('/api/study-categories');
      return response.data;
    },
    { defaultMessage: '카테고리를 불러오는데 실패했습니다.' }
  );
};

// POST /api/studies
export const createStudy = async (data: StudyCreateRequest): Promise<StudyResponse> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.post('/api/studies', data);
      return response.data;
    },
    { defaultMessage: '스터디 등록에 실패했습니다.' }
  );
};

// GET /api/studies (public list - paginated response)
export const fetchStudies = async (): Promise<StudyResponse[]> => {
  return withErrorHandling(
    async () => {
      const client = getPublicClient();
      const response = await client.get('/api/studies');
      return response.data.content || response.data;
    },
    { defaultMessage: '스터디 목록을 불러오는데 실패했습니다.' }
  );
};

// GET /api/studies/nearby
export const fetchNearbyStudies = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 10
): Promise<StudyListResponse[]> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get('/api/studies/nearby', {
        params: { latitude, longitude, radius: radiusKm },
      });
      return response.data;
    },
    { defaultMessage: '근처 스터디를 불러오는데 실패했습니다.' }
  );
};

// GET /api/studies/:id
export const getStudyDetail = async (studyId: number): Promise<StudyDetailResponse> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get(`/api/studies/${studyId}`);
      return response.data;
    },
    {
      defaultMessage: '스터디 정보를 불러오는데 실패했습니다.',
      errorMessages: {
        notFound: '스터디를 찾을 수 없습니다.',
      },
    }
  );
};

// Study Request Types
export interface StudyJoinRequestBody {
  message: string;
}

export interface StudyRequestResponse {
  id: number;
  studyId: number;
  studyTitle: string;
  userId: number;
  userNickname: string;
  userProfileImage?: string;
  message: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectReason?: string;
  createdAt: string;
  processedAt?: string;
}

// POST /api/studies/:studyId/requests - Apply to study
export const applyToStudy = async (studyId: number, message: string): Promise<StudyRequestResponse> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.post(`/api/studies/${studyId}/requests`, { message } as StudyJoinRequestBody);
      return response.data;
    },
    {
      defaultMessage: '스터디 신청에 실패했습니다.',
      errorMessages: {
        conflict: '이미 신청한 스터디입니다.',
        forbidden: '스터디에 신청할 수 없습니다.',
      },
    }
  );
};

// GET /api/users/me/study-requests - Get my study requests
export const getMyStudyRequests = async (): Promise<StudyRequestResponse[]> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get('/api/users/me/study-requests');
      return response.data;
    },
    { defaultMessage: '신청 내역을 불러오는데 실패했습니다.' }
  );
};

// DELETE /api/study-requests/:requestId - Cancel study request
export const cancelStudyRequest = async (requestId: number): Promise<void> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      await client.delete(`/api/study-requests/${requestId}`);
    },
    { defaultMessage: '신청 취소에 실패했습니다.' }
  );
};

// GET /api/studies/popular - Get popular studies (by fill rate)
export const fetchPopularStudies = async (limit: number = 5): Promise<StudyListResponse[]> => {
  return withErrorHandling(
    async () => {
      const client = getPublicClient();
      const response = await client.get('/api/studies/popular', {
        params: { limit },
      });
      return response.data;
    },
    { defaultMessage: '인기 스터디를 불러오는데 실패했습니다.' }
  );
};

// POST /api/studies/:studyId/close - Close study (stop recruiting)
export const closeStudy = async (studyId: number): Promise<void> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      await client.post(`/api/studies/${studyId}/close`);
    },
    {
      defaultMessage: '스터디 모집 마감에 실패했습니다.',
      errorMessages: {
        forbidden: '스터디 리더만 모집을 마감할 수 있습니다.',
      },
    }
  );
};

// POST /api/studies/:studyId/complete - Complete study (end study)
export const completeStudy = async (studyId: number): Promise<void> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      await client.post(`/api/studies/${studyId}/complete`);
    },
    {
      defaultMessage: '스터디 종료에 실패했습니다.',
      errorMessages: {
        forbidden: '스터디 리더만 스터디를 종료할 수 있습니다.',
      },
    }
  );
};

// GET /api/studies/:studyId/requests - Get all study requests (for leader)
// Returns all requests including PENDING, APPROVED, and REJECTED
export const getStudyRequests = async (studyId: number): Promise<StudyRequestResponse[]> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get(`/api/studies/${studyId}/requests`);
      return response.data.content || response.data;
    },
    {
      defaultMessage: '신청자 목록을 불러오는데 실패했습니다.',
      errorMessages: {
        forbidden: '스터디 리더만 신청자 목록을 볼 수 있습니다.',
      },
    }
  );
};

// Alias for backward compatibility
export const getPendingRequests = getStudyRequests;

// POST /api/study-requests/:requestId/approve - Approve request
export const approveStudyRequest = async (requestId: number): Promise<void> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      await client.post(`/api/study-requests/${requestId}/approve`);
    },
    {
      defaultMessage: '신청 승인에 실패했습니다.',
      errorMessages: {
        forbidden: '스터디 리더만 신청을 승인할 수 있습니다.',
        notFound: '신청 정보를 찾을 수 없습니다.',
      },
    }
  );
};

// POST /api/study-requests/:requestId/reject - Reject request
export const rejectStudyRequest = async (requestId: number, reason?: string): Promise<void> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      await client.post(`/api/study-requests/${requestId}/reject`, { rejectReason: reason });
    },
    {
      defaultMessage: '신청 거절에 실패했습니다.',
      errorMessages: {
        forbidden: '스터디 리더만 신청을 거절할 수 있습니다.',
        notFound: '신청 정보를 찾을 수 없습니다.',
      },
    }
  );
};

// Study Update Types (uses same structure as StudyCreateRequest)
export interface StudyUpdateRequest {
  title?: string;
  categoryId?: number;
  subcategoryId?: number;
  coverImageUrl?: string;
  tags?: string[];
  description?: string;
  targetAudience?: string;
  goals?: string;
  studyMethod?: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  daysOfWeek?: string[];
  time?: string;
  durationType?: string;
  platform?: string;
  meetingRegion?: string;
  meetingCity?: string;
  meetingLatitude?: number;
  meetingLongitude?: number;
  maxMembers?: number;
  deposit?: number;
  depositRefundPolicy?: string;
  requirements?: string;
  curriculums?: Array<{ weekNumber: number; title: string; content: string }>;
  rules?: Array<{ ruleOrder: number; content: string }>;
}

// GET /api/studies/search - Search studies by keyword
export interface SearchStudiesParams {
  keyword: string;
  page?: number;
  size?: number;
}

export interface PaginatedStudyResponse {
  content: StudyListResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export const searchStudies = async (params: SearchStudiesParams): Promise<PaginatedStudyResponse> => {
  return withErrorHandling(
    async () => {
      const client = getPublicClient();
      const response = await client.get('/api/studies/search', {
        params: {
          keyword: params.keyword,
          page: params.page || 0,
          size: params.size || 10,
        },
      });
      return response.data;
    },
    { defaultMessage: '스터디 검색에 실패했습니다.' }
  );
};

// GET /api/studies/category/:categoryId - Get studies by category (with optional subcategory filter)
export interface CategoryStudiesParams {
  categoryId: number;
  subcategoryId?: number | null;
  page?: number;
  size?: number;
}

export const fetchStudiesByCategory = async (params: CategoryStudiesParams): Promise<PaginatedStudyResponse> => {
  return withErrorHandling(
    async () => {
      const client = getPublicClient();
      const queryParams: Record<string, number> = {
        page: params.page || 0,
        size: params.size || 10,
      };
      // Add subcategoryId if provided
      if (params.subcategoryId) {
        queryParams.subcategoryId = params.subcategoryId;
      }
      const response = await client.get(`/api/studies/category/${params.categoryId}`, {
        params: queryParams,
      });
      return response.data;
    },
    { defaultMessage: '카테고리별 스터디를 불러오는데 실패했습니다.' }
  );
};

// PATCH /api/studies/:studyId - Update study (full update)
export const updateStudy = async (studyId: number, data: StudyUpdateRequest): Promise<StudyResponse> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.patch(`/api/studies/${studyId}`, data);
      return response.data;
    },
    {
      defaultMessage: '스터디 수정에 실패했습니다.',
      errorMessages: {
        forbidden: '스터디 리더만 수정할 수 있습니다.',
        notFound: '스터디를 찾을 수 없습니다.',
      },
    }
  );
};
