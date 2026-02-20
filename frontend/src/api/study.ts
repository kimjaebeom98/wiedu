import axios from 'axios';
import { getAuthClient, getPublicClient } from './client';
import { Category, StudyCreateRequest, StudyResponse, StudyDetailResponse } from '../types/study';

// GET /api/study-categories (no auth needed)
export const fetchCategories = async (): Promise<Category[]> => {
  const client = getPublicClient();
  const response = await client.get('/api/study-categories');
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
  const client = getPublicClient();
  const response = await client.get('/api/studies');
  // Spring Data JPA returns paginated response with 'content' array
  return response.data.content || response.data;
};

// GET /api/studies/:id
export const getStudyDetail = async (studyId: number): Promise<StudyDetailResponse> => {
  const client = getPublicClient();
  const response = await client.get(`/api/studies/${studyId}`);
  return response.data;
};
