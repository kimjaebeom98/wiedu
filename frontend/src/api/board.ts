import { getAuthClient } from './client';
import {
  BoardPostListItem,
  BoardPostDetail,
  BoardPostCreateRequest,
  BoardPostUpdateRequest,
  BoardComment,
  BoardCommentUpdateRequest,
  PageResponse,
  PostCategory,
  LikeToggleResponse,
} from '../types/board';

// 게시글 목록 조회 (검색 지원)
export const fetchBoardPosts = async (
  studyId: number,
  category?: PostCategory,
  keyword?: string,
  page: number = 0,
  size: number = 20
): Promise<PageResponse<BoardPostListItem>> => {
  const client = await getAuthClient();
  const params: Record<string, string | number> = { page, size };
  if (category) {
    params.category = category;
  }
  if (keyword && keyword.trim()) {
    params.keyword = keyword.trim();
  }
  const response = await client.get(`/api/studies/${studyId}/board/posts`, { params });
  return response.data;
};

// 게시글 상세 조회
export const getBoardPostDetail = async (
  studyId: number,
  postId: number
): Promise<BoardPostDetail> => {
  const client = await getAuthClient();
  const response = await client.get(`/api/studies/${studyId}/board/posts/${postId}`);
  return response.data;
};

// 게시글 작성
export const createBoardPost = async (
  studyId: number,
  data: BoardPostCreateRequest
): Promise<BoardPostDetail> => {
  const client = await getAuthClient();
  const response = await client.post(`/api/studies/${studyId}/board/posts`, data);
  return response.data;
};

// 게시글 수정
export const updateBoardPost = async (
  studyId: number,
  postId: number,
  data: BoardPostUpdateRequest
): Promise<BoardPostDetail> => {
  const client = await getAuthClient();
  const response = await client.put(`/api/studies/${studyId}/board/posts/${postId}`, data);
  return response.data;
};

// 게시글 삭제
export const deleteBoardPost = async (
  studyId: number,
  postId: number
): Promise<void> => {
  const client = await getAuthClient();
  await client.delete(`/api/studies/${studyId}/board/posts/${postId}`);
};

// 게시글 좋아요 토글
export const togglePostLike = async (
  studyId: number,
  postId: number
): Promise<LikeToggleResponse> => {
  const client = await getAuthClient();
  const response = await client.post(`/api/studies/${studyId}/board/posts/${postId}/like`);
  return response.data;
};

// 댓글 작성
export const createBoardComment = async (
  studyId: number,
  postId: number,
  content: string
): Promise<BoardComment> => {
  const client = await getAuthClient();
  const response = await client.post(
    `/api/studies/${studyId}/board/posts/${postId}/comments`,
    { content }
  );
  return response.data;
};

// 댓글 수정
export const updateBoardComment = async (
  studyId: number,
  postId: number,
  commentId: number,
  data: BoardCommentUpdateRequest
): Promise<BoardComment> => {
  const client = await getAuthClient();
  const response = await client.put(
    `/api/studies/${studyId}/board/posts/${postId}/comments/${commentId}`,
    data
  );
  return response.data;
};

// 댓글 삭제
export const deleteBoardComment = async (
  studyId: number,
  postId: number,
  commentId: number
): Promise<void> => {
  const client = await getAuthClient();
  await client.delete(
    `/api/studies/${studyId}/board/posts/${postId}/comments/${commentId}`
  );
};

// 댓글 좋아요 토글
export const toggleCommentLike = async (
  studyId: number,
  postId: number,
  commentId: number
): Promise<LikeToggleResponse> => {
  const client = await getAuthClient();
  const response = await client.post(
    `/api/studies/${studyId}/board/posts/${postId}/comments/${commentId}/like`
  );
  return response.data;
};
