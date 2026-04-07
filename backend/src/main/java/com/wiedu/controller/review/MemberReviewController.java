package com.wiedu.controller.review;

import com.wiedu.dto.review.CreateMemberReviewRequest;
import com.wiedu.dto.review.StudyMemberReviewResponse;
import com.wiedu.dto.review.StudyMemberToReviewResponse;
import com.wiedu.security.SecurityUtils;
import com.wiedu.service.review.MemberReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class MemberReviewController {

    private final MemberReviewService memberReviewService;

    /**
     * 리뷰 대상 멤버 목록 조회
     * GET /api/studies/{studyId}/members/to-review
     */
    @GetMapping("/api/studies/{studyId}/members/to-review")
    public ResponseEntity<List<StudyMemberToReviewResponse>> getMembersToReview(
            @PathVariable Long studyId) {
        Long userId = SecurityUtils.getCurrentUserId();
        List<StudyMemberToReviewResponse> members = memberReviewService.getMembersToReview(studyId, userId);
        return ResponseEntity.ok(members);
    }

    /**
     * 멤버 리뷰 작성
     * POST /api/studies/{studyId}/member-reviews
     */
    @PostMapping("/api/studies/{studyId}/member-reviews")
    public ResponseEntity<StudyMemberReviewResponse> createMemberReview(
            @PathVariable Long studyId,
            @Valid @RequestBody CreateMemberReviewRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        StudyMemberReviewResponse response = memberReviewService.createMemberReview(studyId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 특정 사용자가 받은 멤버 리뷰 목록 조회
     * GET /api/users/{userId}/member-reviews
     */
    @GetMapping("/api/users/{userId}/member-reviews")
    public ResponseEntity<List<StudyMemberReviewResponse>> getMemberReviews(
            @PathVariable Long userId) {
        List<StudyMemberReviewResponse> reviews = memberReviewService.getMemberReviews(userId);
        return ResponseEntity.ok(reviews);
    }

    /**
     * 내가 작성한 멤버 리뷰 목록 조회
     * GET /api/users/me/member-reviews/written
     */
    @GetMapping("/api/users/me/member-reviews/written")
    public ResponseEntity<List<StudyMemberReviewResponse>> getMemberReviewsWrittenByMe() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(memberReviewService.getReviewsWrittenByMe(userId));
    }
}
