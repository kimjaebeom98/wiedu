import { getAuthClient } from './client';
import { CategoryTemperature } from '../types/categoryTemperature';

export const getCategoryTemperatures = async (userId: number): Promise<CategoryTemperature[]> => {
  const client = getAuthClient();
  const response = await client.get(`/api/users/${userId}/category-temperatures`);
  return response.data;
};
