import axios from 'axios';
import { getAuthClient, getPublicClient } from './client';
import { Category, StudyCreateRequest, StudyResponse, StudyDetailResponse, StudyListResponse } from '../types/study';

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

// GET /api/studies/nearby
export const fetchNearbyStudies = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 10
): Promise<StudyListResponse[]> => {
  const client = getAuthClient();
  const response = await client.get('/api/studies/nearby', {
    params: { latitude, longitude, radius: radiusKm },
  });
  return response.data;
};

// GET /api/studies/:id
export const getStudyDetail = async (studyId: number): Promise<StudyDetailResponse> => {
  const client = getPublicClient();
  const response = await client.get(`/api/studies/${studyId}`);
  return response.data;
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
  const client = getAuthClient();
  const response = await client.post(`/api/studies/${studyId}/requests`, { message } as StudyJoinRequestBody);
  return response.data;
};

// GET /api/users/me/study-requests - Get my study requests
export const getMyStudyRequests = async (): Promise<StudyRequestResponse[]> => {
  const client = getAuthClient();
  const response = await client.get('/api/users/me/study-requests');
  return response.data;
};

// DELETE /api/study-requests/:requestId - Cancel study request
export const cancelStudyRequest = async (requestId: number): Promise<void> => {
  const client = getAuthClient();
  await client.delete(`/api/study-requests/${requestId}`);
};

// GET /api/studies/popular - Get popular studies (by fill rate)
export const fetchPopularStudies = async (limit: number = 5): Promise<StudyListResponse[]> => {
  const client = getPublicClient();
  const response = await client.get('/api/studies/popular', {
    params: { limit },
  });
  return response.data;
};
