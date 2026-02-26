package com.wiedu.controller.user;

import com.wiedu.dto.user.MyStudyResponse;
import com.wiedu.security.SecurityUtils;
import com.wiedu.service.user.MyStudiesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 내 스터디 목록 API 컨트롤러
 */
@RestController
@RequestMapping("/api/users/me/studies")
@RequiredArgsConstructor
public class MyStudiesController {

    private final MyStudiesService myStudiesService;

    /**
     * 내 스터디 목록 조회
     * GET /api/users/me/studies?status=ACTIVE&role=LEADER
     *
     * @param status 스터디 상태 필터 (ACTIVE=진행중, COMPLETED=완료, 없으면 전체)
     * @param role   역할 필터 (LEADER=운영, MEMBER=참여, 없으면 전체)
     */
    @GetMapping
    public ResponseEntity<List<MyStudyResponse>> getMyStudies(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String role
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        List<MyStudyResponse> response = myStudiesService.getMyStudies(userId, status, role);
        return ResponseEntity.ok(response);
    }
}
