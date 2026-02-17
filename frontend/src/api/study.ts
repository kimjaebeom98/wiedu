import axios from 'axios';
import { getBaseURL } from '../config/api';
import { getAccessToken } from '../storage/token';
import { Category, StudyCreateRequest, StudyResponse } from '../types/study';

const createAuthClient = async () => {
  const token = await getAccessToken();
  return axios.create({
    baseURL: getBaseURL(),
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};

// GET /api/study-categories (no auth needed)
export const fetchCategories = async (): Promise<Category[]> => {
  const response = await axios.get(`${getBaseURL()}/api/study-categories`, {
    timeout: 10000,
  });
  return response.data;
};

// POST /api/studies
export const createStudy = async (data: StudyCreateRequest): Promise<StudyResponse> => {
  const token = await getAccessToken();
  console.log('[createStudy] Token exists:', !!token, token ? `(${token.substring(0, 20)}...)` : '');

  if (!token) {
    throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');
  }

  const client = await createAuthClient();
  const response = await client.post('/api/studies', data);
  return response.data;
};

// GET /api/studies/:id
export const getStudyDetail = async (studyId: number): Promise<StudyResponse> => {
  const response = await axios.get(`${getBaseURL()}/api/studies/${studyId}`, {
    timeout: 10000,
  });
  return response.data;
};
