import { getAuthClient } from './client';
import { MyProfile, MyStudy } from '../types/profile';

export const getMyProfile = async (): Promise<MyProfile> => {
  const client = getAuthClient();
  const response = await client.get('/api/users/me');
  return response.data;
};

export const getMyStudies = async (): Promise<MyStudy[]> => {
  const client = getAuthClient();
  const response = await client.get('/api/users/me/studies');
  return response.data;
};
