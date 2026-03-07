import { getAuthClient } from './client';
import { withErrorHandling } from './apiError';
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
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get(`/api/studies/${studyId}/gallery/photos`, {
        params: { page, size },
      });
      return response.data;
    },
    { defaultMessage: '갤러리를 불러오는데 실패했습니다.' }
  );
};

/**
 * 갤러리 사진 상세 조회
 */
export const getGalleryPhotoDetail = async (
  studyId: number,
  photoId: number
): Promise<GalleryPhoto> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get(`/api/studies/${studyId}/gallery/photos/${photoId}`);
      return response.data;
    },
    {
      defaultMessage: '사진을 불러오는데 실패했습니다.',
      errorMessages: {
        notFound: '사진을 찾을 수 없습니다.',
      },
    }
  );
};

/**
 * 갤러리 사진 업로드
 */
export const uploadGalleryPhoto = async (
  studyId: number,
  file: { uri: string; name: string; type: string },
  caption?: string
): Promise<GalleryPhoto> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();

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
    },
    {
      defaultMessage: '사진 업로드에 실패했습니다.',
      errorMessages: {
        forbidden: '사진을 업로드할 권한이 없습니다.',
      },
    }
  );
};

/**
 * 갤러리 사진 캡션 수정
 */
export const updateGalleryPhoto = async (
  studyId: number,
  photoId: number,
  data: GalleryPhotoUpdateRequest
): Promise<GalleryPhoto> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.put(
        `/api/studies/${studyId}/gallery/photos/${photoId}`,
        data
      );
      return response.data;
    },
    {
      defaultMessage: '사진 수정에 실패했습니다.',
      errorMessages: {
        forbidden: '사진을 수정할 권한이 없습니다.',
        notFound: '사진을 찾을 수 없습니다.',
      },
    }
  );
};

/**
 * 갤러리 사진 삭제
 */
export const deleteGalleryPhoto = async (
  studyId: number,
  photoId: number
): Promise<void> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      await client.delete(`/api/studies/${studyId}/gallery/photos/${photoId}`);
    },
    {
      defaultMessage: '사진 삭제에 실패했습니다.',
      errorMessages: {
        forbidden: '사진을 삭제할 권한이 없습니다.',
        notFound: '사진을 찾을 수 없습니다.',
      },
    }
  );
};

/**
 * 갤러리 사진 개수 조회
 */
export const getGalleryPhotoCount = async (
  studyId: number
): Promise<GalleryCountResponse> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get(`/api/studies/${studyId}/gallery/count`);
      return response.data;
    },
    { defaultMessage: '갤러리 정보를 불러오는데 실패했습니다.' }
  );
};
