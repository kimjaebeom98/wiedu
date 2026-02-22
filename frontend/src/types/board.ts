export type PostCategory = 'NOTICE' | 'CHAT' | 'QNA';

export interface BoardPostListItem {
  id: number;
  category: PostCategory;
  title: string;
  preview: string;
  authorId: number;
  authorNickname: string;
  authorProfileImage?: string;
  viewCount: number;
  commentCount: number;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
}

export interface BoardComment {
  id: number;
  authorId: number;
  authorNickname: string;
  authorProfileImage?: string;
  content: string;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface BoardPostDetail {
  id: number;
  category: PostCategory;
  title: string;
  content: string;
  authorId: number;
  authorNickname: string;
  authorProfileImage?: string;
  viewCount: number;
  commentCount: number;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt?: string;
  comments: BoardComment[];
}

export interface BoardPostCreateRequest {
  category: PostCategory;
  title: string;
  content: string;
}

export interface BoardPostUpdateRequest {
  title: string;
  content: string;
}

export interface BoardCommentUpdateRequest {
  content: string;
}

export interface LikeToggleResponse {
  isLiked: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
  first: boolean;
}

// Category badge colors from design.pen
export const CATEGORY_COLORS: Record<PostCategory, { text: string; bg: string }> = {
  NOTICE: { text: '#EF4444', bg: '#EF444420' },
  CHAT: { text: '#3B82F6', bg: '#3B82F620' },
  QNA: { text: '#22C55E', bg: '#22C55E20' },
};

export const CATEGORY_LABELS: Record<PostCategory, string> = {
  NOTICE: '공지',
  CHAT: '잡담',
  QNA: '질문',
};
