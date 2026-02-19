import axios from 'axios';
import { getBaseURL } from '../config/api';
import { getAuthClient } from './client';
import { Category, StudyCreateRequest, StudyResponse } from '../types/study';

// GET /api/study-categories (no auth needed)
export const fetchCategories = async (): Promise<Category[]> => {
  const response = await axios.get(`${getBaseURL()}/api/study-categories`, {
    timeout: 10000,
  });
  return response.data;
};

// POST /api/studies
export const createStudy = async (data: StudyCreateRequest): Promise<StudyResponse> => {
  const client = getAuthClient();
  const response = await client.post('/api/studies', data);
  return response.data;
};

// GET /api/studies (public list - paginated response)
export const fetchStudies = async (): Promise<StudyResponse[]> => {
  const response = await axios.get(`${getBaseURL()}/api/studies`, {
    timeout: 10000,
  });
  // Spring Data JPA returns paginated response with 'content' array
  return response.data.content || response.data;
};

// GET /api/studies/:id
export const getStudyDetail = async (studyId: number): Promise<StudyResponse> => {
  const response = await axios.get(`${getBaseURL()}/api/studies/${studyId}`, {
    timeout: 10000,
  });
  return response.data;
};
