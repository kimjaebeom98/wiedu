package com.wiedu.controller.review;

import com.wiedu.dto.review.CreateReviewRequest;
import com.wiedu.dto.review.StudyLeaderReviewResponse;
import com.wiedu.dto.review.StudyLeaderReviewsResponse;
import com.wiedu.security.SecurityUtils;
import com.wiedu.service.review.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * 스터디장이 받은 리뷰 목록 조회
     * GET /api/users/{userId}/reviews
     */
    @GetMapping("/api/users/{userId}/reviews")
    public ResponseEntity<StudyLeaderReviewsResponse> getLeaderReviews(
            @PathVariable Long userId) {
        StudyLeaderReviewsResponse response = reviewService.getLeaderReviews(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 스터디장 리뷰 작성
     * POST /api/studies/{studyId}/reviews
     */
    @PostMapping("/api/studies/{studyId}/reviews")
    public ResponseEntity<StudyLeaderReviewResponse> createReview(
            @PathVariable Long studyId,
            @Valid @RequestBody CreateReviewRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        StudyLeaderReviewResponse response = reviewService.createReview(studyId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
