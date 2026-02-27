import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import {
  BoardPostDetail,
  BoardComment,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
} from '../../types/board';
import {
  getBoardPostDetail,
  createBoardComment,
  updateBoardComment,
  deleteBoardComment,
  deleteBoardPost,
  updateBoardPost,
  togglePostLike,
  toggleCommentLike,
} from '../../api/board';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'BoardPostDetail'>;

export default function BoardPostDetailScreen({ route, navigation }: Props) {
  const { studyId, postId } = route.params;
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [post, setPost] = useState<BoardPostDetail | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit states
  const [editingPost, setEditingPost] = useState(false);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostContent, setEditPostContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState('');

  useEffect(() => {
    loadCurrentUser();
    loadPost();
  }, [postId]);

  const loadCurrentUser = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUserId(user.id);
      }
    } catch (error) {
      console.error('Failed to load current user:', error);
    }
  };

  const loadPost = async () => {
    try {
      setLoading(true);
      const data = await getBoardPostDetail(studyId, postId);
      setPost(data);
    } catch (error) {
      console.error('Failed to load post:', error);
      Alert.alert('오류', '게시글을 불러오는데 실패했습니다.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPost();
    setRefreshing(false);
  }, [postId]);

  // Post actions
  const handleEditPost = () => {
    if (!post) return;
    setEditPostTitle(post.title);
    setEditPostContent(post.content);
    setEditingPost(true);
  };

  const handleSavePost = async () => {
    if (!editPostTitle.trim() || !editPostContent.trim()) {
      Alert.alert('오류', '제목과 내용을 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      const updated = await updateBoardPost(studyId, postId, {
        title: editPostTitle.trim(),
        content: editPostContent.trim(),
      });
      setPost(updated);
      setEditingPost(false);
      Alert.alert('완료', '게시글이 수정되었습니다.');
    } catch (error) {
      console.error('Failed to update post:', error);
      Alert.alert('오류', '게시글 수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = () => {
    Alert.alert(
      '게시글 삭제',
      '정말 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBoardPost(studyId, postId);
              Alert.alert('완료', '게시글이 삭제되었습니다.');
              navigation.goBack();
            } catch (error) {
              console.error('Failed to delete post:', error);
              Alert.alert('오류', '게시글 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleTogglePostLike = async () => {
    if (!post) return;
    try {
      const response = await togglePostLike(studyId, postId);
      setPost((prev) =>
        prev
          ? {
              ...prev,
              isLiked: response.isLiked,
              likeCount: response.isLiked ? prev.likeCount + 1 : prev.likeCount - 1,
            }
          : null
      );
    } catch (error) {
      console.error('Failed to toggle post like:', error);
    }
  };

  // Comment actions
  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;

    try {
      setSubmitting(true);
      const newComment = await createBoardComment(studyId, postId, commentText.trim());
      setPost((prev) =>
        prev
          ? {
              ...prev,
              comments: [...prev.comments, newComment],
              commentCount: prev.commentCount + 1,
            }
          : null
      );
      setCommentText('');
    } catch (error) {
      console.error('Failed to create comment:', error);
      Alert.alert('오류', '댓글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = (comment: BoardComment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.content);
  };

  const handleSaveComment = async () => {
    if (!editCommentText.trim() || !editingCommentId) return;

    try {
      setSubmitting(true);
      const updated = await updateBoardComment(studyId, postId, editingCommentId, {
        content: editCommentText.trim(),
      });
      setPost((prev) =>
        prev
          ? {
              ...prev,
              comments: prev.comments.map((c) =>
                c.id === editingCommentId ? updated : c
              ),
            }
          : null
      );
      setEditingCommentId(null);
      setEditCommentText('');
    } catch (error) {
      console.error('Failed to update comment:', error);
      Alert.alert('오류', '댓글 수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentText('');
  };

  const handleDeleteComment = (commentId: number) => {
    Alert.alert(
      '댓글 삭제',
      '정말 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBoardComment(studyId, postId, commentId);
              setPost((prev) =>
                prev
                  ? {
                      ...prev,
                      comments: prev.comments.filter((c) => c.id !== commentId),
                      commentCount: prev.commentCount - 1,
                    }
                  : null
              );
            } catch (error) {
              console.error('Failed to delete comment:', error);
              Alert.alert('오류', '댓글 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleToggleCommentLike = async (commentId: number) => {
    try {
      const response = await toggleCommentLike(studyId, postId, commentId);
      setPost((prev) =>
        prev
          ? {
              ...prev,
              comments: prev.comments.map((c) =>
                c.id === commentId
                  ? {
                      ...c,
                      isLiked: response.isLiked,
                      likeCount: response.isLiked ? c.likeCount + 1 : c.likeCount - 1,
                    }
                  : c
              ),
            }
          : null
      );
    } catch (error) {
      console.error('Failed to toggle comment like:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;

    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Check if content was actually edited (more than 1 second difference)
  const wasEdited = (createdAt: string, updatedAt?: string): boolean => {
    if (!updatedAt) return false;
    const created = new Date(createdAt).getTime();
    const updated = new Date(updatedAt).getTime();
    return Math.abs(updated - created) > 1000; // More than 1 second difference
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!post) {
    return null;
  }

  const isAuthor = currentUserId === post.authorId;
  const categoryColor = CATEGORY_COLORS[post.category];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>게시글</Text>
        {isAuthor ? (
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleEditPost} style={styles.headerButton}>
              <Feather name="edit-2" size={18} color="#8B5CF6" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeletePost} style={styles.headerButton}>
              <Feather name="trash-2" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />
          }
        >
        {/* Post Content */}
        <View style={styles.postCard}>
          {/* Category Badge */}
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: categoryColor.bg },
            ]}
          >
            <Text style={[styles.categoryText, { color: categoryColor.text }]}>
              {CATEGORY_LABELS[post.category]}
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{post.title}</Text>

          {/* Author Info */}
          <View style={styles.authorRow}>
            {post.authorProfileImage ? (
              <Image source={{ uri: post.authorProfileImage }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Feather name="user" size={16} color="#71717A" />
              </View>
            )}
            <Text style={styles.authorName}>{post.authorNickname}</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
            {wasEdited(post.createdAt, post.updatedAt) && (
              <>
                <Text style={styles.dot}>·</Text>
                <Text style={styles.editedLabel}>수정됨</Text>
              </>
            )}
          </View>

          {/* Content */}
          <Text style={styles.content}>{post.content}</Text>

          {/* Post Stats & Actions */}
          <View style={styles.postStats}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Feather name="eye" size={14} color="#71717A" />
                <Text style={styles.statText}>{post.viewCount}</Text>
              </View>
              <View style={styles.statItem}>
                <Feather name="message-circle" size={14} color="#71717A" />
                <Text style={styles.statText}>{post.commentCount}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.likeButton} onPress={handleTogglePostLike}>
              <Feather
                name="heart"
                size={18}
                color={post.isLiked ? '#EF4444' : '#71717A'}
              />
              <Text style={[styles.likeText, post.isLiked && styles.likedText]}>
                {post.likeCount}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsHeader}>댓글 {post.commentCount}개</Text>

          {post.comments.map((comment) => (
            <View key={comment.id} style={styles.commentCard}>
              {editingCommentId === comment.id ? (
                // Edit mode
                <View style={styles.editCommentContainer}>
                  <TextInput
                    style={styles.editCommentInput}
                    value={editCommentText}
                    onChangeText={setEditCommentText}
                    multiline
                    autoFocus
                  />
                  <View style={styles.editCommentActions}>
                    <TouchableOpacity
                      style={styles.editCancelButton}
                      onPress={handleCancelEditComment}
                    >
                      <Text style={styles.editCancelText}>취소</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.editSaveButton, submitting && styles.editSaveButtonDisabled]}
                      onPress={handleSaveComment}
                      disabled={submitting}
                    >
                      <Text style={styles.editSaveText}>저장</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                // View mode
                <>
                  <View style={styles.commentHeader}>
                    <View style={styles.commentAuthorRow}>
                      {comment.authorProfileImage ? (
                        <Image source={{ uri: comment.authorProfileImage }} style={styles.commentAvatarImage} />
                      ) : (
                        <View style={styles.commentAvatar}>
                          <Feather name="user" size={14} color="#71717A" />
                        </View>
                      )}
                      <Text style={styles.commentAuthor}>{comment.authorNickname}</Text>
                      <Text style={styles.dot}>·</Text>
                      <Text style={styles.commentDate}>{formatDate(comment.createdAt)}</Text>
                      {wasEdited(comment.createdAt, comment.updatedAt) && (
                        <Text style={styles.editedLabel}> (수정됨)</Text>
                      )}
                    </View>
                    {currentUserId === comment.authorId && (
                      <View style={styles.commentActions}>
                        <TouchableOpacity
                          onPress={() => handleEditComment(comment)}
                          style={styles.commentActionButton}
                        >
                          <Feather name="edit-2" size={14} color="#71717A" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteComment(comment.id)}
                          style={styles.commentActionButton}
                        >
                          <Feather name="trash-2" size={14} color="#71717A" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  <Text style={styles.commentContent}>{comment.content}</Text>
                  <TouchableOpacity
                    style={styles.commentLikeButton}
                    onPress={() => handleToggleCommentLike(comment.id)}
                  >
                    <Feather
                      name="heart"
                      size={14}
                      color={comment.isLiked ? '#EF4444' : '#71717A'}
                    />
                    <Text style={[styles.commentLikeText, comment.isLiked && styles.likedText]}>
                      {comment.likeCount}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

        {/* Comment Input - inside KeyboardAvoidingView */}
        <View style={[styles.commentInputContainer, { paddingBottom: Math.max(12, insets.bottom) }]}>
          <TextInput
            style={styles.commentInput}
            placeholder="댓글을 입력하세요"
            placeholderTextColor="#71717A"
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!commentText.trim() || submitting) && styles.sendButtonDisabled,
            ]}
            onPress={handleSubmitComment}
            disabled={!commentText.trim() || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Feather name="send" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Edit Post Modal */}
      <Modal visible={editingPost} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditingPost(false)}>
              <Text style={styles.modalCancelText}>취소</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>게시글 수정</Text>
            <TouchableOpacity onPress={handleSavePost} disabled={submitting}>
              <Text style={[styles.modalSaveText, submitting && styles.modalSaveTextDisabled]}>
                {submitting ? '저장 중...' : '저장'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.editTitleInput}
              placeholder="제목"
              placeholderTextColor="#71717A"
              value={editPostTitle}
              onChangeText={setEditPostTitle}
              maxLength={200}
            />
            <TextInput
              style={styles.editContentInput}
              placeholder="내용을 입력하세요"
              placeholderTextColor="#71717A"
              value={editPostContent}
              onChangeText={setEditPostContent}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#18181B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#18181B',
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 4,
  },
  headerSpacer: {
    width: 56,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  postCard: {
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 16,
    margin: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3F3F46',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  authorName: {
    fontSize: 13,
    color: '#71717A',
    fontWeight: '500',
  },
  dot: {
    fontSize: 13,
    color: '#71717A',
    marginHorizontal: 6,
  },
  date: {
    fontSize: 13,
    color: '#71717A',
  },
  editedLabel: {
    fontSize: 12,
    color: '#71717A',
    fontStyle: 'italic',
  },
  content: {
    fontSize: 15,
    color: '#E4E4E7',
    lineHeight: 24,
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#3F3F46',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: '#71717A',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#3F3F46',
    borderRadius: 20,
  },
  likeText: {
    fontSize: 14,
    color: '#71717A',
    fontWeight: '500',
  },
  likedText: {
    color: '#EF4444',
  },
  commentsSection: {
    padding: 16,
    paddingTop: 0,
  },
  commentsHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  commentCard: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  commentAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3F3F46',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  commentAvatarImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  commentAuthor: {
    fontSize: 13,
    color: '#E4E4E7',
    fontWeight: '500',
  },
  commentDate: {
    fontSize: 12,
    color: '#71717A',
  },
  commentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  commentActionButton: {
    padding: 4,
  },
  commentContent: {
    fontSize: 14,
    color: '#E4E4E7',
    lineHeight: 20,
  },
  commentLikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  commentLikeText: {
    fontSize: 12,
    color: '#71717A',
  },
  editCommentContainer: {
    gap: 8,
  },
  editCommentInput: {
    backgroundColor: '#3F3F46',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#FFFFFF',
    minHeight: 60,
  },
  editCommentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  editCancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  editCancelText: {
    fontSize: 14,
    color: '#71717A',
  },
  editSaveButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  editSaveButtonDisabled: {
    backgroundColor: '#52525B',
  },
  editSaveText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 12,
    backgroundColor: '#27272A',
    borderTopWidth: 1,
    borderTopColor: '#3F3F46',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#3F3F46',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#FFFFFF',
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#52525B',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#71717A',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  modalSaveTextDisabled: {
    color: '#52525B',
  },
  modalContent: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  editTitleInput: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
  },
  editContentInput: {
    flex: 1,
    backgroundColor: '#27272A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
  },
});
