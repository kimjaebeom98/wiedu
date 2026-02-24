import { getAuthClient } from './client';
import {
  GalleryPhoto,
  GalleryPhotoUpdateRequest,
  GalleryPageResponse,
  GalleryCountResponse,
} from '../types/gallery';

/**
 * 갤러리 사진 목록 조회
 */
export const fetchGalleryPhotos = async (
  studyId: number,
  page: number = 0,
  size: number = 20
): Promise<GalleryPageResponse> => {
  const client = await getAuthClient();
  const response = await client.get(`/api/studies/${studyId}/gallery/photos`, {
    params: { page, size },
  });
  return response.data;
};

/**
 * 갤러리 사진 상세 조회
 */
export const getGalleryPhotoDetail = async (
  studyId: number,
  photoId: number
): Promise<GalleryPhoto> => {
  const client = await getAuthClient();
  const response = await client.get(`/api/studies/${studyId}/gallery/photos/${photoId}`);
  return response.data;
};

/**
 * 갤러리 사진 업로드
 */
export const uploadGalleryPhoto = async (
  studyId: number,
  file: { uri: string; name: string; type: string },
  caption?: string
): Promise<GalleryPhoto> => {
  const client = await getAuthClient();

  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any);

  if (caption) {
    formData.append('caption', caption);
  }

  const response = await client.post(
    `/api/studies/${studyId}/gallery/photos`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

/**
 * 갤러리 사진 캡션 수정
 */
export const updateGalleryPhoto = async (
  studyId: number,
  photoId: number,
  data: GalleryPhotoUpdateRequest
): Promise<GalleryPhoto> => {
  const client = await getAuthClient();
  const response = await client.put(
    `/api/studies/${studyId}/gallery/photos/${photoId}`,
    data
  );
  return response.data;
};

/**
 * 갤러리 사진 삭제
 */
export const deleteGalleryPhoto = async (
  studyId: number,
  photoId: number
): Promise<void> => {
  const client = await getAuthClient();
  await client.delete(`/api/studies/${studyId}/gallery/photos/${photoId}`);
};

/**
 * 갤러리 사진 개수 조회
 */
export const getGalleryPhotoCount = async (
  studyId: number
): Promise<GalleryCountResponse> => {
  const client = await getAuthClient();
  const response = await client.get(`/api/studies/${studyId}/gallery/count`);
  return response.data;
};
