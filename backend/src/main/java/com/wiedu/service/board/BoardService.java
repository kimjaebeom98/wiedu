package com.wiedu.service.board;

import com.wiedu.domain.entity.*;
import com.wiedu.domain.enums.MemberRole;
import com.wiedu.domain.enums.MemberStatus;
import com.wiedu.domain.enums.PostCategory;
import com.wiedu.dto.board.*;
import com.wiedu.exception.BusinessException;
import com.wiedu.exception.ErrorCode;
import com.wiedu.repository.board.BoardCommentLikeRepository;
import com.wiedu.repository.board.BoardCommentRepository;
import com.wiedu.repository.board.BoardPostLikeRepository;
import com.wiedu.repository.board.BoardPostRepository;
import com.wiedu.repository.study.StudyMemberRepository;
import com.wiedu.service.study.StudyService;
import com.wiedu.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.dao.DataIntegrityViolationException;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BoardService {

    private final BoardPostRepository boardPostRepository;
    private final BoardCommentRepository boardCommentRepository;
    private final BoardPostLikeRepository boardPostLikeRepository;
    private final BoardCommentLikeRepository boardCommentLikeRepository;
    private final StudyMemberRepository studyMemberRepository;
    private final StudyService studyService;
    private final UserService userService;

    // 게시글 목록 조회 (검색 지원)
    public Page<BoardPostListResponse> getPosts(Long studyId, PostCategory category, String keyword, Long userId, Pageable pageable) {
        Study study = studyService.findStudyEntityById(studyId);
        User user = userService.findUserEntityById(userId);
        validateMembership(study, userId);

        Page<BoardPost> posts;
        if (keyword != null && !keyword.trim().isEmpty()) {
            if (category != null) {
                posts = boardPostRepository.searchByKeywordAndCategory(study, category, keyword.trim(), pageable);
            } else {
                posts = boardPostRepository.searchByKeyword(study, keyword.trim(), pageable);
            }
        } else {
            if (category != null) {
                posts = boardPostRepository.findByStudyAndCategoryWithAuthor(study, category, pageable);
            } else {
                posts = boardPostRepository.findByStudyWithAuthor(study, pageable);
            }
        }

        // N+1 방지: 모든 게시글의 좋아요 여부를 한 번에 조회
        List<Long> postIds = posts.getContent().stream()
                .map(BoardPost::getId)
                .collect(Collectors.toList());
        Set<Long> likedPostIds = boardPostLikeRepository.findLikedPostIdsByUserAndPostIds(user, postIds);

        return posts.map(post -> {
            boolean isLiked = likedPostIds.contains(post.getId());
            return BoardPostListResponse.from(post, isLiked);
        });
    }

    // 게시글 상세 조회
    @Transactional
    public BoardPostDetailResponse getPostDetail(Long studyId, Long postId, Long userId) {
        Study study = studyService.findStudyEntityById(studyId);
        User user = userService.findUserEntityById(userId);
        validateMembership(study, userId);

        BoardPost post = boardPostRepository.findByIdWithDetails(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_POST_NOT_FOUND));

        if (!post.getStudy().getId().equals(studyId)) {
            throw new BusinessException(ErrorCode.BOARD_POST_NOT_FOUND);
        }

        // Increment view count
        boardPostRepository.incrementViewCount(postId);

        boolean isPostLiked = boardPostLikeRepository.existsByPostAndUser(post, user);

        List<BoardComment> comments = boardCommentRepository.findByPostWithAuthor(post);

        // N+1 방지: 모든 댓글의 좋아요 여부를 한 번에 조회
        List<Long> commentIds = comments.stream()
                .map(BoardComment::getId)
                .collect(Collectors.toList());
        Set<Long> likedCommentIds = boardCommentLikeRepository.findLikedCommentIdsByUserAndCommentIds(user, commentIds);

        List<BoardCommentResponse> commentResponses = comments.stream()
                .map(comment -> {
                    boolean isCommentLiked = likedCommentIds.contains(comment.getId());
                    return BoardCommentResponse.from(comment, isCommentLiked);
                })
                .toList();

        return BoardPostDetailResponse.from(post, commentResponses, isPostLiked);
    }

    // 게시글 작성
    @Transactional
    public BoardPostDetailResponse createPost(Long studyId, Long userId, BoardPostCreateRequest request) {
        Study study = studyService.findStudyEntityById(studyId);
        User user = userService.findUserEntityById(userId);
        StudyMember member = validateMembershipAndGet(study, user);

        // NOTICE는 리더만 작성 가능
        if (request.category() == PostCategory.NOTICE && member.getRole() != MemberRole.LEADER) {
            throw new BusinessException(ErrorCode.NOTICE_LEADER_ONLY);
        }

        BoardPost post = BoardPost.builder()
                .study(study)
                .author(user)
                .category(request.category())
                .title(request.title())
                .content(request.content())
                .build();

        BoardPost savedPost = boardPostRepository.save(post);
        return BoardPostDetailResponse.from(savedPost, List.of(), false);
    }

    // 게시글 수정
    @Transactional
    public BoardPostDetailResponse updatePost(Long studyId, Long postId, Long userId, BoardPostUpdateRequest request) {
        Study study = studyService.findStudyEntityById(studyId);
        User user = userService.findUserEntityById(userId);
        validateMembership(study, userId);

        BoardPost post = boardPostRepository.findByIdWithDetails(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_POST_NOT_FOUND));

        if (!post.getStudy().getId().equals(studyId)) {
            throw new BusinessException(ErrorCode.BOARD_POST_NOT_FOUND);
        }

        if (!post.getAuthor().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.NOT_POST_AUTHOR);
        }

        post.update(request.title(), request.content());

        boolean isLiked = boardPostLikeRepository.existsByPostAndUser(post, user);
        List<BoardComment> comments = boardCommentRepository.findByPostWithAuthor(post);

        // N+1 방지: 모든 댓글의 좋아요 여부를 한 번에 조회
        List<Long> commentIds = comments.stream()
                .map(BoardComment::getId)
                .collect(Collectors.toList());
        Set<Long> likedCommentIds = boardCommentLikeRepository.findLikedCommentIdsByUserAndCommentIds(user, commentIds);

        List<BoardCommentResponse> commentResponses = comments.stream()
                .map(comment -> {
                    boolean isCommentLiked = likedCommentIds.contains(comment.getId());
                    return BoardCommentResponse.from(comment, isCommentLiked);
                })
                .toList();

        return BoardPostDetailResponse.from(post, commentResponses, isLiked);
    }

    // 게시글 삭제 (본인 또는 스터디 리더만 가능)
    @Transactional
    public void deletePost(Long studyId, Long postId, Long userId) {
        Study study = studyService.findStudyEntityById(studyId);
        User user = userService.findUserEntityById(userId);
        validateMembership(study, userId);

        BoardPost post = boardPostRepository.findByIdWithDetails(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_POST_NOT_FOUND));

        if (!post.getStudy().getId().equals(studyId)) {
            throw new BusinessException(ErrorCode.BOARD_POST_NOT_FOUND);
        }

        // 본인 또는 스터디 리더만 삭제 가능
        boolean isAuthor = post.getAuthor() != null && post.getAuthor().getId().equals(userId);
        boolean isLeader = studyMemberRepository.findByStudyAndUser(study, user)
                .map(m -> m.getRole() == MemberRole.LEADER)
                .orElse(false);

        if (!isAuthor && !isLeader) {
            throw new BusinessException(ErrorCode.NOT_POST_AUTHOR);
        }

        boardCommentRepository.deleteAllByPost(post);
        boardPostRepository.delete(post);
    }

    // 게시글 좋아요 토글 (Race Condition 방지)
    @Transactional
    public boolean togglePostLike(Long studyId, Long postId, Long userId) {
        Study study = studyService.findStudyEntityById(studyId);
        User user = userService.findUserEntityById(userId);
        validateMembership(study, userId);

        BoardPost post = boardPostRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_POST_NOT_FOUND));

        if (!post.getStudy().getId().equals(studyId)) {
            throw new BusinessException(ErrorCode.BOARD_POST_NOT_FOUND);
        }

        return boardPostLikeRepository.findByPostAndUser(post, user)
                .map(like -> {
                    boardPostLikeRepository.delete(like);
                    // Atomic 감소 쿼리 사용 (Lost Update 방지)
                    boardPostRepository.decrementLikeCount(postId);
                    return false;
                })
                .orElseGet(() -> {
                    try {
                        BoardPostLike like = BoardPostLike.builder()
                                .post(post)
                                .user(user)
                                .build();
                        boardPostLikeRepository.save(like);
                        // Atomic 증가 쿼리 사용 (Lost Update 방지)
                        boardPostRepository.incrementLikeCount(postId);
                        return true;
                    } catch (DataIntegrityViolationException e) {
                        // 동시 요청으로 이미 좋아요가 추가된 경우 - 이미 좋아요 상태로 처리
                        return true;
                    }
                });
    }

    // 댓글 작성
    @Transactional
    public BoardCommentResponse createComment(Long studyId, Long postId, Long userId, BoardCommentCreateRequest request) {
        Study study = studyService.findStudyEntityById(studyId);
        User user = userService.findUserEntityById(userId);
        validateMembership(study, userId);

        BoardPost post = boardPostRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_POST_NOT_FOUND));

        if (!post.getStudy().getId().equals(studyId)) {
            throw new BusinessException(ErrorCode.BOARD_POST_NOT_FOUND);
        }

        BoardComment comment = BoardComment.builder()
                .post(post)
                .author(user)
                .content(request.content())
                .build();

        BoardComment savedComment = boardCommentRepository.save(comment);
        boardPostRepository.incrementCommentCount(post.getId());

        return BoardCommentResponse.from(savedComment, false);
    }

    // 댓글 수정
    @Transactional
    public BoardCommentResponse updateComment(Long studyId, Long postId, Long commentId, Long userId, BoardCommentUpdateRequest request) {
        Study study = studyService.findStudyEntityById(studyId);
        User user = userService.findUserEntityById(userId);
        validateMembership(study, userId);

        BoardComment comment = boardCommentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_COMMENT_NOT_FOUND));

        if (!comment.getPost().getId().equals(postId)) {
            throw new BusinessException(ErrorCode.BOARD_COMMENT_NOT_FOUND);
        }

        if (!comment.getAuthor().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.NOT_COMMENT_AUTHOR);
        }

        comment.update(request.content());

        boolean isLiked = boardCommentLikeRepository.existsByCommentAndUser(comment, user);
        return BoardCommentResponse.from(comment, isLiked);
    }

    // 댓글 삭제 (본인 또는 스터디 리더만 가능)
    @Transactional
    public void deleteComment(Long studyId, Long postId, Long commentId, Long userId) {
        Study study = studyService.findStudyEntityById(studyId);
        User user = userService.findUserEntityById(userId);
        validateMembership(study, userId);

        BoardComment comment = boardCommentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_COMMENT_NOT_FOUND));

        if (!comment.getPost().getId().equals(postId)) {
            throw new BusinessException(ErrorCode.BOARD_COMMENT_NOT_FOUND);
        }

        // 본인 또는 스터디 리더만 삭제 가능
        boolean isAuthor = comment.getAuthor() != null && comment.getAuthor().getId().equals(userId);
        boolean isLeader = studyMemberRepository.findByStudyAndUser(study, user)
                .map(m -> m.getRole() == MemberRole.LEADER)
                .orElse(false);

        if (!isAuthor && !isLeader) {
            throw new BusinessException(ErrorCode.NOT_COMMENT_AUTHOR);
        }

        BoardPost post = comment.getPost();
        boardCommentRepository.delete(comment);
        boardPostRepository.decrementCommentCount(post.getId());
    }

    // 댓글 좋아요 토글 (Race Condition 방지)
    @Transactional
    public boolean toggleCommentLike(Long studyId, Long postId, Long commentId, Long userId) {
        Study study = studyService.findStudyEntityById(studyId);
        User user = userService.findUserEntityById(userId);
        validateMembership(study, userId);

        BoardComment comment = boardCommentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_COMMENT_NOT_FOUND));

        if (!comment.getPost().getId().equals(postId)) {
            throw new BusinessException(ErrorCode.BOARD_COMMENT_NOT_FOUND);
        }

        return boardCommentLikeRepository.findByCommentAndUser(comment, user)
                .map(like -> {
                    boardCommentLikeRepository.delete(like);
                    // Atomic 감소 쿼리 사용 (Lost Update 방지)
                    boardCommentRepository.decrementLikeCount(commentId);
                    return false;
                })
                .orElseGet(() -> {
                    try {
                        BoardCommentLike like = BoardCommentLike.builder()
                                .comment(comment)
                                .user(user)
                                .build();
                        boardCommentLikeRepository.save(like);
                        // Atomic 증가 쿼리 사용 (Lost Update 방지)
                        boardCommentRepository.incrementLikeCount(commentId);
                        return true;
                    } catch (DataIntegrityViolationException e) {
                        // 동시 요청으로 이미 좋아요가 추가된 경우 - 이미 좋아요 상태로 처리
                        return true;
                    }
                });
    }

    // Helper methods
    private void validateMembership(Study study, Long userId) {
        User user = userService.findUserEntityById(userId);
        boolean isMember = studyMemberRepository.existsByStudyAndUserAndStatus(study, user, MemberStatus.ACTIVE);
        if (!isMember) {
            throw new BusinessException(ErrorCode.NOT_STUDY_MEMBER);
        }
    }

    private StudyMember validateMembershipAndGet(Study study, User user) {
        return studyMemberRepository.findByStudyAndUser(study, user)
                .filter(m -> m.getStatus() == MemberStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_STUDY_MEMBER));
    }
}
