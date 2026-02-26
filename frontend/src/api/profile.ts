import { getAuthClient } from './client';
import { MyProfile } from '../types/profile';

export const getMyProfile = async (): Promise<MyProfile> => {
  const client = getAuthClient();
  const response = await client.get('/api/users/me');
  return response.data;
};
