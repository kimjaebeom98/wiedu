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
import com.wiedu.repository.study.StudyRepository;
import com.wiedu.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BoardService {

    private final BoardPostRepository boardPostRepository;
    private final BoardCommentRepository boardCommentRepository;
    private final BoardPostLikeRepository boardPostLikeRepository;
    private final BoardCommentLikeRepository boardCommentLikeRepository;
    private final StudyRepository studyRepository;
    private final StudyMemberRepository studyMemberRepository;
    private final UserRepository userRepository;

    // 게시글 목록 조회 (검색 지원)
    public Page<BoardPostListResponse> getPosts(Long studyId, PostCategory category, String keyword, Long userId, Pageable pageable) {
        Study study = findStudyById(studyId);
        User user = findUserById(userId);
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

        return posts.map(post -> {
            boolean isLiked = boardPostLikeRepository.existsByPostAndUser(post, user);
            return BoardPostListResponse.from(post, isLiked);
        });
    }

    // 게시글 상세 조회
    @Transactional
    public BoardPostDetailResponse getPostDetail(Long studyId, Long postId, Long userId) {
        Study study = findStudyById(studyId);
        User user = findUserById(userId);
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
        List<BoardCommentResponse> commentResponses = comments.stream()
                .map(comment -> {
                    boolean isCommentLiked = boardCommentLikeRepository.existsByCommentAndUser(comment, user);
                    return BoardCommentResponse.from(comment, isCommentLiked);
                })
                .toList();

        return BoardPostDetailResponse.from(post, commentResponses, isPostLiked);
    }

    // 게시글 작성
    @Transactional
    public BoardPostDetailResponse createPost(Long studyId, Long userId, BoardPostCreateRequest request) {
        Study study = findStudyById(studyId);
        User user = findUserById(userId);
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
        Study study = findStudyById(studyId);
        User user = findUserById(userId);
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
        List<BoardCommentResponse> commentResponses = comments.stream()
                .map(comment -> {
                    boolean isCommentLiked = boardCommentLikeRepository.existsByCommentAndUser(comment, user);
                    return BoardCommentResponse.from(comment, isCommentLiked);
                })
                .toList();

        return BoardPostDetailResponse.from(post, commentResponses, isLiked);
    }

    // 게시글 삭제
    @Transactional
    public void deletePost(Long studyId, Long postId, Long userId) {
        Study study = findStudyById(studyId);
        validateMembership(study, userId);

        BoardPost post = boardPostRepository.findByIdWithDetails(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_POST_NOT_FOUND));

        if (!post.getStudy().getId().equals(studyId)) {
            throw new BusinessException(ErrorCode.BOARD_POST_NOT_FOUND);
        }

        if (!post.getAuthor().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.NOT_POST_AUTHOR);
        }

        boardCommentRepository.deleteAllByPost(post);
        boardPostRepository.delete(post);
    }

    // 게시글 좋아요 토글
    @Transactional
    public boolean togglePostLike(Long studyId, Long postId, Long userId) {
        Study study = findStudyById(studyId);
        User user = findUserById(userId);
        validateMembership(study, userId);

        BoardPost post = boardPostRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_POST_NOT_FOUND));

        if (!post.getStudy().getId().equals(studyId)) {
            throw new BusinessException(ErrorCode.BOARD_POST_NOT_FOUND);
        }

        return boardPostLikeRepository.findByPostAndUser(post, user)
                .map(like -> {
                    boardPostLikeRepository.delete(like);
                    post.decrementLikeCount();
                    return false;
                })
                .orElseGet(() -> {
                    BoardPostLike like = BoardPostLike.builder()
                            .post(post)
                            .user(user)
                            .build();
                    boardPostLikeRepository.save(like);
                    post.incrementLikeCount();
                    return true;
                });
    }

    // 댓글 작성
    @Transactional
    public BoardCommentResponse createComment(Long studyId, Long postId, Long userId, BoardCommentCreateRequest request) {
        Study study = findStudyById(studyId);
        User user = findUserById(userId);
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
        post.incrementCommentCount();

        return BoardCommentResponse.from(savedComment, false);
    }

    // 댓글 수정
    @Transactional
    public BoardCommentResponse updateComment(Long studyId, Long postId, Long commentId, Long userId, BoardCommentUpdateRequest request) {
        Study study = findStudyById(studyId);
        User user = findUserById(userId);
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

    // 댓글 삭제
    @Transactional
    public void deleteComment(Long studyId, Long postId, Long commentId, Long userId) {
        Study study = findStudyById(studyId);
        validateMembership(study, userId);

        BoardComment comment = boardCommentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_COMMENT_NOT_FOUND));

        if (!comment.getPost().getId().equals(postId)) {
            throw new BusinessException(ErrorCode.BOARD_COMMENT_NOT_FOUND);
        }

        if (!comment.getAuthor().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.NOT_COMMENT_AUTHOR);
        }

        BoardPost post = comment.getPost();
        boardCommentRepository.delete(comment);
        post.decrementCommentCount();
    }

    // 댓글 좋아요 토글
    @Transactional
    public boolean toggleCommentLike(Long studyId, Long postId, Long commentId, Long userId) {
        Study study = findStudyById(studyId);
        User user = findUserById(userId);
        validateMembership(study, userId);

        BoardComment comment = boardCommentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_COMMENT_NOT_FOUND));

        if (!comment.getPost().getId().equals(postId)) {
            throw new BusinessException(ErrorCode.BOARD_COMMENT_NOT_FOUND);
        }

        return boardCommentLikeRepository.findByCommentAndUser(comment, user)
                .map(like -> {
                    boardCommentLikeRepository.delete(like);
                    comment.decrementLikeCount();
                    return false;
                })
                .orElseGet(() -> {
                    BoardCommentLike like = BoardCommentLike.builder()
                            .comment(comment)
                            .user(user)
                            .build();
                    boardCommentLikeRepository.save(like);
                    comment.incrementLikeCount();
                    return true;
                });
    }

    // Helper methods
    private Study findStudyById(Long studyId) {
        return studyRepository.findById(studyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));
    }

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    private void validateMembership(Study study, Long userId) {
        User user = findUserById(userId);
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
