package com.wiedu.controller;

import com.wiedu.dto.response.StudyMemberResponse;
import com.wiedu.service.StudyMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 스터디 멤버 API 컨트롤러
 */
@RestController
@RequestMapping("/api/studies/{studyId}/members")
@RequiredArgsConstructor
public class StudyMemberController {

    private final StudyMemberService studyMemberService;

    /**
     * 스터디 멤버 목록 조회
     * GET /api/studies/{studyId}/members
     */
    @GetMapping
    public ResponseEntity<List<StudyMemberResponse>> getMembers(@PathVariable Long studyId) {
        List<StudyMemberResponse> response = studyMemberService.findMembersByStudyId(studyId);
        return ResponseEntity.ok(response);
    }

    /**
     * 스터디 멤버 여부 확인
     * GET /api/studies/{studyId}/members/check
     */
    @GetMapping("/check")
    public ResponseEntity<Boolean> checkMembership(
            @PathVariable Long studyId,
            @RequestHeader("X-User-Id") Long userId) {
        boolean isMember = studyMemberService.isMemberOfStudy(studyId, userId);
        return ResponseEntity.ok(isMember);
    }

    /**
     * 스터디 탈퇴
     * DELETE /api/studies/{studyId}/members/me
     */
    @DeleteMapping("/me")
    public ResponseEntity<Void> withdrawFromStudy(
            @PathVariable Long studyId,
            @RequestHeader("X-User-Id") Long userId) {
        studyMemberService.withdrawFromStudy(studyId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 멤버 강제 탈퇴 (리더 전용)
     * DELETE /api/studies/{studyId}/members/{targetUserId}
     */
    @DeleteMapping("/{targetUserId}")
    public ResponseEntity<Void> kickMember(
            @PathVariable Long studyId,
            @PathVariable Long targetUserId,
            @RequestHeader("X-User-Id") Long userId) {
        studyMemberService.kickMember(studyId, userId, targetUserId);
        return ResponseEntity.ok().build();
    }

    /**
     * 리더 위임
     * POST /api/studies/{studyId}/members/{newLeaderId}/promote
     */
    @PostMapping("/{newLeaderId}/promote")
    public ResponseEntity<Void> delegateLeader(
            @PathVariable Long studyId,
            @PathVariable Long newLeaderId,
            @RequestHeader("X-User-Id") Long userId) {
        studyMemberService.delegateLeader(studyId, userId, newLeaderId);
        return ResponseEntity.ok().build();
    }
}
