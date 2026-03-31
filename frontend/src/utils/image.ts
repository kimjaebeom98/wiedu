/**
 * 이미지 URL 유틸리티
 */

/**
 * 유효한 서버 이미지 URL인지 확인
 * file:// 로컬 URI는 다른 사용자가 접근 불가하므로 무효 처리
 */
export const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url || url.trim() === '') return false;

  // file:// 로컬 URI는 서버에서 접근 불가
  if (url.startsWith('file://')) return false;

  // http:// 또는 https:// URL만 유효
  return url.startsWith('http://') || url.startsWith('https://');
};

/**
 * 이미지 URL 반환, 무효한 경우 null 반환
 */
export const getValidImageUrl = (url: string | null | undefined): string | null => {
  return isValidImageUrl(url) ? url! : null;
};
