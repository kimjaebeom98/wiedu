package com.wiedu.controller.board;

import com.wiedu.domain.enums.PostCategory;
import com.wiedu.dto.board.*;
import com.wiedu.security.SecurityUtils;
import com.wiedu.service.board.BoardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/studies/{studyId}/board")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    // 게시글 목록 조회 (검색 지원)
    @GetMapping("/posts")
    public ResponseEntity<Page<BoardPostListResponse>> getPosts(
            @PathVariable Long studyId,
            @RequestParam(required = false) PostCategory category,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        Long userId = SecurityUtils.getCurrentUserId();
        Page<BoardPostListResponse> posts = boardService.getPosts(studyId, category, keyword, userId, pageable);
        return ResponseEntity.ok(posts);
    }

    // 게시글 상세 조회
    @GetMapping("/posts/{postId}")
    public ResponseEntity<BoardPostDetailResponse> getPostDetail(
            @PathVariable Long studyId,
            @PathVariable Long postId) {
        Long userId = SecurityUtils.getCurrentUserId();
        BoardPostDetailResponse post = boardService.getPostDetail(studyId, postId, userId);
        return ResponseEntity.ok(post);
    }

    // 게시글 작성
    @PostMapping("/posts")
    public ResponseEntity<BoardPostDetailResponse> createPost(
            @PathVariable Long studyId,
            @Valid @RequestBody BoardPostCreateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        BoardPostDetailResponse post = boardService.createPost(studyId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(post);
    }

    // 게시글 수정
    @PutMapping("/posts/{postId}")
    public ResponseEntity<BoardPostDetailResponse> updatePost(
            @PathVariable Long studyId,
            @PathVariable Long postId,
            @Valid @RequestBody BoardPostUpdateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        BoardPostDetailResponse post = boardService.updatePost(studyId, postId, userId, request);
        return ResponseEntity.ok(post);
    }

    // 게시글 삭제
    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long studyId,
            @PathVariable Long postId) {
        Long userId = SecurityUtils.getCurrentUserId();
        boardService.deletePost(studyId, postId, userId);
        return ResponseEntity.noContent().build();
    }

    // 게시글 좋아요 토글
    @PostMapping("/posts/{postId}/like")
    public ResponseEntity<Map<String, Boolean>> togglePostLike(
            @PathVariable Long studyId,
            @PathVariable Long postId) {
        Long userId = SecurityUtils.getCurrentUserId();
        boolean isLiked = boardService.togglePostLike(studyId, postId, userId);
        return ResponseEntity.ok(Map.of("isLiked", isLiked));
    }

    // 댓글 작성
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<BoardCommentResponse> createComment(
            @PathVariable Long studyId,
            @PathVariable Long postId,
            @Valid @RequestBody BoardCommentCreateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        BoardCommentResponse comment = boardService.createComment(studyId, postId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    // 댓글 수정
    @PutMapping("/posts/{postId}/comments/{commentId}")
    public ResponseEntity<BoardCommentResponse> updateComment(
            @PathVariable Long studyId,
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @Valid @RequestBody BoardCommentUpdateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        BoardCommentResponse comment = boardService.updateComment(studyId, postId, commentId, userId, request);
        return ResponseEntity.ok(comment);
    }

    // 댓글 삭제
    @DeleteMapping("/posts/{postId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long studyId,
            @PathVariable Long postId,
            @PathVariable Long commentId) {
        Long userId = SecurityUtils.getCurrentUserId();
        boardService.deleteComment(studyId, postId, commentId, userId);
        return ResponseEntity.noContent().build();
    }

    // 댓글 좋아요 토글
    @PostMapping("/posts/{postId}/comments/{commentId}/like")
    public ResponseEntity<Map<String, Boolean>> toggleCommentLike(
            @PathVariable Long studyId,
            @PathVariable Long postId,
            @PathVariable Long commentId) {
        Long userId = SecurityUtils.getCurrentUserId();
        boolean isLiked = boardService.toggleCommentLike(studyId, postId, commentId, userId);
        return ResponseEntity.ok(Map.of("isLiked", isLiked));
    }
}
