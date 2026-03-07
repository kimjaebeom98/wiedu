import { getAuthClient } from './client';
import { withErrorHandling } from './apiError';
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
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const params: Record<string, string | number> = { page, size };
      if (category) {
        params.category = category;
      }
      if (keyword && keyword.trim()) {
        params.keyword = keyword.trim();
      }
      const response = await client.get(`/api/studies/${studyId}/board/posts`, { params });
      return response.data;
    },
    { defaultMessage: '게시글 목록을 불러오는데 실패했습니다.' }
  );
};

// 게시글 상세 조회
export const getBoardPostDetail = async (
  studyId: number,
  postId: number
): Promise<BoardPostDetail> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get(`/api/studies/${studyId}/board/posts/${postId}`);
      return response.data;
    },
    {
      defaultMessage: '게시글을 불러오는데 실패했습니다.',
      errorMessages: {
        notFound: '게시글을 찾을 수 없습니다.',
      },
    }
  );
};

// 게시글 작성
export const createBoardPost = async (
  studyId: number,
  data: BoardPostCreateRequest
): Promise<BoardPostDetail> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.post(`/api/studies/${studyId}/board/posts`, data);
      return response.data;
    },
    {
      defaultMessage: '게시글 작성에 실패했습니다.',
      errorMessages: {
        forbidden: '게시글을 작성할 권한이 없습니다.',
      },
    }
  );
};

// 게시글 수정
export const updateBoardPost = async (
  studyId: number,
  postId: number,
  data: BoardPostUpdateRequest
): Promise<BoardPostDetail> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.put(`/api/studies/${studyId}/board/posts/${postId}`, data);
      return response.data;
    },
    {
      defaultMessage: '게시글 수정에 실패했습니다.',
      errorMessages: {
        forbidden: '게시글을 수정할 권한이 없습니다.',
        notFound: '게시글을 찾을 수 없습니다.',
      },
    }
  );
};

// 게시글 삭제
export const deleteBoardPost = async (
  studyId: number,
  postId: number
): Promise<void> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      await client.delete(`/api/studies/${studyId}/board/posts/${postId}`);
    },
    {
      defaultMessage: '게시글 삭제에 실패했습니다.',
      errorMessages: {
        forbidden: '게시글을 삭제할 권한이 없습니다.',
        notFound: '게시글을 찾을 수 없습니다.',
      },
    }
  );
};

// 게시글 좋아요 토글
export const togglePostLike = async (
  studyId: number,
  postId: number
): Promise<LikeToggleResponse> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.post(`/api/studies/${studyId}/board/posts/${postId}/like`);
      return response.data;
    },
    { defaultMessage: '좋아요 처리에 실패했습니다.' }
  );
};

// 댓글 작성
export const createBoardComment = async (
  studyId: number,
  postId: number,
  content: string
): Promise<BoardComment> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.post(
        `/api/studies/${studyId}/board/posts/${postId}/comments`,
        { content }
      );
      return response.data;
    },
    { defaultMessage: '댓글 작성에 실패했습니다.' }
  );
};

// 댓글 수정
export const updateBoardComment = async (
  studyId: number,
  postId: number,
  commentId: number,
  data: BoardCommentUpdateRequest
): Promise<BoardComment> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.put(
        `/api/studies/${studyId}/board/posts/${postId}/comments/${commentId}`,
        data
      );
      return response.data;
    },
    {
      defaultMessage: '댓글 수정에 실패했습니다.',
      errorMessages: {
        forbidden: '댓글을 수정할 권한이 없습니다.',
      },
    }
  );
};

// 댓글 삭제
export const deleteBoardComment = async (
  studyId: number,
  postId: number,
  commentId: number
): Promise<void> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      await client.delete(
        `/api/studies/${studyId}/board/posts/${postId}/comments/${commentId}`
      );
    },
    {
      defaultMessage: '댓글 삭제에 실패했습니다.',
      errorMessages: {
        forbidden: '댓글을 삭제할 권한이 없습니다.',
      },
    }
  );
};

// 댓글 좋아요 토글
export const toggleCommentLike = async (
  studyId: number,
  postId: number,
  commentId: number
): Promise<LikeToggleResponse> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.post(
        `/api/studies/${studyId}/board/posts/${postId}/comments/${commentId}/like`
      );
      return response.data;
    },
    { defaultMessage: '좋아요 처리에 실패했습니다.' }
  );
};
