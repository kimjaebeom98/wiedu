import { getAuthClient } from './client';
import { withErrorHandling } from './apiError';

export interface FileUploadResponse {
  url: string;
}

export type FileType = 'cover' | 'profile' | 'gallery' | 'general';

/**
 * 파일 업로드
 * @param file 업로드할 파일 정보
 * @param type 파일 용도 (cover: 스터디 커버, profile: 프로필, gallery: 갤러리)
 * @returns 업로드된 파일의 접근 URL
 */
export const uploadFile = async (
  file: { uri: string; name: string; type: string },
  fileType: FileType = 'general'
): Promise<FileUploadResponse> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);

      const response = await client.post(
        `/api/files/upload?type=${fileType}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    },
    { defaultMessage: '파일 업로드에 실패했습니다.' }
  );
};

/**
 * 스터디 커버 이미지 업로드 헬퍼
 */
export const uploadCoverImage = async (
  uri: string
): Promise<string> => {
  // URI에서 파일명 추출
  const filename = uri.split('/').pop() || 'cover.jpg';
  // 확장자로 MIME 타입 추정
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

  const result = await uploadFile(
    { uri, name: filename, type: mimeType },
    'cover'
  );

  return result.url;
};
