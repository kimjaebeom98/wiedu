import { getAuthClient } from './client';
import { withErrorHandling } from './apiError';
import {
  CurriculumResponse,
  CurriculumUpdateRequest,
  SessionResponse,
  SessionRequest,
} from '../types/curriculum';

// ==================== Curriculum (주차) APIs ====================

// GET /api/studies/:studyId/curriculums - Get all curriculums for a study
export const getCurriculums = async (studyId: number): Promise<CurriculumResponse[]> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get(`/api/studies/${studyId}/curriculums`);
      return response.data;
    },
    { defaultMessage: '커리큘럼을 불러오는데 실패했습니다.' }
  );
};

// GET /api/curriculums/:curriculumId - Get curriculum detail with sessions
export const getCurriculumDetail = async (curriculumId: number): Promise<CurriculumResponse> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get(`/api/curriculums/${curriculumId}`);
      return response.data;
    },
    { defaultMessage: '커리큘럼 상세를 불러오는데 실패했습니다.' }
  );
};

// POST /api/studies/:studyId/curriculums - Add new curriculum (week)
export const addCurriculum = async (studyId: number): Promise<CurriculumResponse> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.post(`/api/studies/${studyId}/curriculums`);
      return response.data;
    },
    {
      defaultMessage: '주차 추가에 실패했습니다.',
      errorMessages: {
        forbidden: '스터디장만 커리큘럼을 수정할 수 있습니다.',
      },
    }
  );
};

// PUT /api/curriculums/:curriculumId - Update curriculum
export const updateCurriculum = async (
  curriculumId: number,
  data: CurriculumUpdateRequest
): Promise<CurriculumResponse> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.put(`/api/curriculums/${curriculumId}`, data);
      return response.data;
    },
    {
      defaultMessage: '커리큘럼 수정에 실패했습니다.',
      errorMessages: {
        forbidden: '스터디장만 커리큘럼을 수정할 수 있습니다.',
      },
    }
  );
};

// DELETE /api/curriculums/:curriculumId - Delete curriculum
export const deleteCurriculum = async (curriculumId: number): Promise<void> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      await client.delete(`/api/curriculums/${curriculumId}`);
    },
    {
      defaultMessage: '커리큘럼 삭제에 실패했습니다.',
      errorMessages: {
        forbidden: '스터디장만 커리큘럼을 수정할 수 있습니다.',
      },
    }
  );
};

// ==================== Session (회차) APIs ====================

// GET /api/curriculums/:curriculumId/sessions - Get sessions for a curriculum
export const getSessions = async (curriculumId: number): Promise<SessionResponse[]> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get(`/api/curriculums/${curriculumId}/sessions`);
      return response.data;
    },
    { defaultMessage: '회차 목록을 불러오는데 실패했습니다.' }
  );
};

// GET /api/sessions/:sessionId - Get session detail
export const getSession = async (sessionId: number): Promise<SessionResponse> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get(`/api/sessions/${sessionId}`);
      return response.data;
    },
    { defaultMessage: '회차 정보를 불러오는데 실패했습니다.' }
  );
};

// POST /api/curriculums/:curriculumId/sessions - Add new session
export const addSession = async (
  curriculumId: number,
  data: SessionRequest
): Promise<SessionResponse> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.post(`/api/curriculums/${curriculumId}/sessions`, data);
      return response.data;
    },
    {
      defaultMessage: '회차 추가에 실패했습니다.',
      errorMessages: {
        forbidden: '스터디장만 회차를 수정할 수 있습니다.',
      },
    }
  );
};

// PUT /api/sessions/:sessionId - Update session
export const updateSession = async (
  sessionId: number,
  data: SessionRequest
): Promise<SessionResponse> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.put(`/api/sessions/${sessionId}`, data);
      return response.data;
    },
    {
      defaultMessage: '회차 수정에 실패했습니다.',
      errorMessages: {
        forbidden: '스터디장만 회차를 수정할 수 있습니다.',
      },
    }
  );
};

// DELETE /api/sessions/:sessionId - Delete session
export const deleteSession = async (sessionId: number): Promise<void> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      await client.delete(`/api/sessions/${sessionId}`);
    },
    {
      defaultMessage: '회차 삭제에 실패했습니다.',
      errorMessages: {
        forbidden: '스터디장만 회차를 수정할 수 있습니다.',
      },
    }
  );
};
