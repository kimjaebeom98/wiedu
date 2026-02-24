export interface GalleryPhoto {
  id: number;
  studyId: number;
  uploaderId: number;
  uploaderNickname: string;
  uploaderProfileImage?: string;
  originalFileName: string;
  storedFileUrl: string;
  thumbnailUrl?: string;
  mimeType: string;
  fileSize: number;
  caption?: string;
  createdAt: string;
}

export interface GalleryPhotoUpdateRequest {
  caption?: string;
}

export interface GalleryPageResponse {
  content: GalleryPhoto[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
  first: boolean;
}

export interface GalleryCountResponse {
  count: number;
}

// 파일 크기를 읽기 쉬운 형식으로 변환
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 지원되는 이미지 타입
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
