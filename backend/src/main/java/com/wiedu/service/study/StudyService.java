package com.wiedu.service.study;

import com.wiedu.domain.entity.Study;
import com.wiedu.domain.entity.StudyCategory;
import com.wiedu.domain.entity.StudyCurriculum;
import com.wiedu.domain.entity.StudyMember;
import com.wiedu.domain.entity.StudyRule;
import com.wiedu.domain.entity.StudySubcategory;
import com.wiedu.domain.entity.StudyTag;
import com.wiedu.domain.entity.User;
import com.wiedu.domain.enums.MemberRole;
import com.wiedu.domain.enums.MemberStatus;
import com.wiedu.domain.enums.StudyStatus;
import com.wiedu.dto.study.CurriculumRequest;
import com.wiedu.dto.study.RuleRequest;
import com.wiedu.dto.study.StudyCreateRequest;
import com.wiedu.dto.study.StudyUpdateRequest;
import com.wiedu.dto.study.StudyListResponse;
import com.wiedu.dto.study.StudyResponse;
import com.wiedu.exception.BusinessException;
import com.wiedu.exception.ErrorCode;
import com.wiedu.repository.study.StudyBookmarkRepository;
import com.wiedu.repository.study.StudyCategoryRepository;
import com.wiedu.repository.study.StudyMemberRepository;
import com.wiedu.repository.study.StudyRepository;
import com.wiedu.repository.study.StudySubcategoryRepository;
import com.wiedu.service.file.FileStorageService;
import com.wiedu.service.notification.NotificationService;
import com.wiedu.service.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 스터디 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyService {

    private final StudyRepository studyRepository;
    private final StudyMemberRepository studyMemberRepository;
    private final StudyBookmarkRepository studyBookmarkRepository;
    private final StudyCategoryRepository studyCategoryRepository;
    private final StudySubcategoryRepository studySubcategoryRepository;
    private final UserService userService;
    private final NotificationService notificationService;
    private final FileStorageService fileStorageService;
    private final jakarta.persistence.EntityManager entityManager;

    private static final int MAX_ACTIVE_STUDIES = 3;

    /**
     * 스터디 생성 (6단계 플로우)
     */
    @Transactional
    public StudyResponse createStudy(Long leaderId, StudyCreateRequest request) {
        // Step 0: 활성 스터디 수 제한 검증 (최대 3개)
        long activeStudyCount = studyMemberRepository.countActiveStudiesByUserId(
                leaderId,
                MemberStatus.ACTIVE,
                java.util.List.of(StudyStatus.RECRUITING, StudyStatus.IN_PROGRESS)
        );
        if (activeStudyCount >= MAX_ACTIVE_STUDIES) {
            throw new BusinessException(ErrorCode.STUDY_LIMIT_EXCEEDED);
        }

        User leader = userService.findUserEntityById(leaderId);

        // Step 1: 카테고리/서브카테고리 조회 및 검증
        StudyCategory category = studyCategoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));

        StudySubcategory subcategory = null;
        if (request.subcategoryId() != null) {
            subcategory = studySubcategoryRepository.findById(request.subcategoryId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.SUBCATEGORY_NOT_FOUND));
            // 서브카테고리가 해당 카테고리에 속하는지 검증
            if (!subcategory.getCategory().getId().equals(category.getId())) {
                throw new BusinessException(ErrorCode.SUBCATEGORY_NOT_IN_CATEGORY);
            }
        }

        // daysOfWeek 리스트를 콤마 구분 문자열로 변환
        String daysOfWeekJson = request.daysOfWeek() != null ?
                String.join(",", request.daysOfWeek()) : null;

        // 스터디 엔티티 생성
        Study study = Study.builder()
                .title(request.title())
                .description(request.description())
                .category(category)
                .subcategory(subcategory)
                .coverImageUrl(request.coverImageUrl())
                .targetAudience(request.targetAudience())
                .goals(request.goals())
                .studyMethod(request.studyMethod())
                .daysOfWeek(daysOfWeekJson)
                .time(request.time())
                .durationType(request.durationType())
                .platform(request.platform())
                .leader(leader)
                .maxMembers(request.maxMembers())
                .deposit(request.deposit())
                .depositRefundPolicy(request.depositRefundPolicy())
                .requirements(request.requirements())
                .meetingRegion(request.meetingRegion())
                .meetingCity(request.meetingCity())
                .meetingLatitude(request.meetingLatitude())
                .meetingLongitude(request.meetingLongitude())
                .build();

        Study savedStudy = studyRepository.save(study);

        // 태그 저장
        if (request.tags() != null && !request.tags().isEmpty()) {
            int order = 0;
            for (String tagName : request.tags()) {
                StudyTag tag = StudyTag.create(savedStudy, tagName, order++);
                savedStudy.addTag(tag);
            }
        }

        // 커리큘럼 저장
        if (request.curriculums() != null && !request.curriculums().isEmpty()) {
            for (CurriculumRequest curr : request.curriculums()) {
                StudyCurriculum curriculum = StudyCurriculum.create(
                        savedStudy, curr.weekNumber(), curr.title(), curr.content());
                savedStudy.addCurriculum(curriculum);
            }
        }

        // 규칙 저장
        if (request.rules() != null && !request.rules().isEmpty()) {
            for (RuleRequest rule : request.rules()) {
                StudyRule studyRule = StudyRule.create(savedStudy, rule.ruleOrder(), rule.content());
                savedStudy.addRule(studyRule);
            }
        }

        // 리더를 첫 번째 멤버로 자동 등록
        StudyMember leaderMember = StudyMember.builder()
                .study(savedStudy)
                .user(leader)
                .role(MemberRole.LEADER)
                .build();
        studyMemberRepository.save(leaderMember);

        return StudyResponse.from(savedStudy);
    }

    /**
     * 스터디 상세 조회 (N+1 방지) - 비로그인 사용자용
     */
    public StudyResponse findById(Long studyId) {
        Study study = studyRepository.findByIdWithDetails(studyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));
        // 활성 멤버 목록 조회 (User 포함, N+1 방지)
        java.util.List<StudyMember> members = studyMemberRepository.findByStudyAndStatusWithUser(study, MemberStatus.ACTIVE);
        return StudyResponse.from(study, null, null, members, null);
    }

    /**
     * 스터디 상세 조회 (N+1 방지) - 로그인 사용자용 (멤버십 정보 + 북마크 포함)
     */
    public StudyResponse findById(Long studyId, Long userId) {
        Study study = studyRepository.findByIdWithDetails(studyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));

        // 활성 멤버 목록 조회 (User 포함, N+1 방지)
        java.util.List<StudyMember> members = studyMemberRepository.findByStudyAndStatusWithUser(study, MemberStatus.ACTIVE);

        if (userId == null) {
            return StudyResponse.from(study, null, null, members, null);
        }

        // 멤버십 확인
        User user = userService.findUserEntityById(userId);
        java.util.Optional<StudyMember> membership = studyMemberRepository.findByStudyAndUser(study, user);

        // 북마크 여부 확인
        boolean isBookmarked = studyBookmarkRepository.existsByUserIdAndStudyId(userId, studyId);

        if (membership.isPresent() && membership.get().getStatus() == MemberStatus.ACTIVE) {
            return StudyResponse.from(study, true, membership.get().getRole(), members, isBookmarked);
        } else {
            return StudyResponse.from(study, false, null, members, isBookmarked);
        }
    }

    /**
     * 스터디 목록 조회 (페이징, N+1 방지)
     */
    public Page<StudyListResponse> findAllStudies(Pageable pageable) {
        return studyRepository.findAllWithLeader(pageable)
                .map(StudyListResponse::from);
    }

    /**
     * 상태별 스터디 목록 조회 (N+1 방지)
     */
    public Page<StudyListResponse> findByStatus(StudyStatus status, Pageable pageable) {
        return studyRepository.findByStatusWithLeader(status, pageable)
                .map(StudyListResponse::from);
    }

    /**
     * 카테고리별 스터디 목록 조회 (N+1 방지)
     * 정책: RECRUITING/IN_PROGRESS는 항상 표시, CLOSED/COMPLETED는 7일 이내만 표시
     */
    public Page<StudyListResponse> findByCategory(Long categoryId, Pageable pageable) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(7);
        return studyRepository.findByCategoryIdWithLeader(categoryId, cutoffDate, pageable)
                .map(StudyListResponse::from);
    }

    /**
     * 카테고리 + 서브카테고리별 스터디 목록 조회 (N+1 방지)
     * 정책: RECRUITING/IN_PROGRESS는 항상 표시, CLOSED/COMPLETED는 7일 이내만 표시
     */
    public Page<StudyListResponse> findByCategoryAndSubcategory(Long categoryId, Long subcategoryId, Pageable pageable) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(7);
        if (subcategoryId == null) {
            return findByCategory(categoryId, pageable);
        }
        return studyRepository.findByCategoryIdAndSubcategoryIdWithLeader(categoryId, subcategoryId, cutoffDate, pageable)
                .map(StudyListResponse::from);
    }

    /**
     * 모집 중인 스터디 목록 조회 (N+1 방지)
     */
    public Page<StudyListResponse> findRecruitingStudies(Pageable pageable) {
        return studyRepository.findByStatusWithLeader(StudyStatus.RECRUITING, pageable)
                .map(StudyListResponse::from);
    }

    /**
     * 키워드 검색 (N+1 방지, LIKE 와일드카드 이스케이프 처리)
     */
    public Page<StudyListResponse> searchByKeyword(String keyword, Pageable pageable) {
        // LIKE 와일드카드 문자 이스케이프 처리
        String sanitizedKeyword = keyword
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
        return studyRepository.searchByKeywordWithLeader(sanitizedKeyword, pageable)
                .map(StudyListResponse::from);
    }

    /**
     * 근처 스터디 검색 (위치 기반, N+1 방지)
     * Fallback: 근처 스터디가 없으면 모집중인 최신 스터디로 대체
     */
    public java.util.List<StudyListResponse> findNearbyStudies(Double latitude, Double longitude, Double radiusKm) {
        // 1. 네이티브 쿼리로 근처 스터디 ID 조회
        java.util.List<Study> nearbyStudies = studyRepository.findNearbyStudies(latitude, longitude, radiusKm);

        // Fallback: 근처 스터디가 없으면 모집중인 최신 스터디로 대체
        if (nearbyStudies.isEmpty()) {
            return studyRepository.findAllRecruitingStudies(Pageable.ofSize(10))
                    .stream()
                    .map(StudyListResponse::from)
                    .toList();
        }

        // 2. ID 목록 추출
        java.util.List<Long> studyIds = nearbyStudies.stream()
                .map(Study::getId)
                .toList();

        // 3. JOIN FETCH로 연관 엔티티 함께 조회 (N+1 방지)
        java.util.List<Study> studiesWithDetails = studyRepository.findByIdsWithLeaderAndCategory(studyIds);

        // 4. 원래 순서(거리순) 유지를 위한 정렬
        java.util.Map<Long, Study> studyMap = studiesWithDetails.stream()
                .collect(java.util.stream.Collectors.toMap(Study::getId, s -> s));

        return studyIds.stream()
                .map(studyMap::get)
                .filter(java.util.Objects::nonNull)
                .map(StudyListResponse::from)
                .toList();
    }

    /**
     * 인기 스터디 조회 (충원율 높은 순)
     * Fallback: 인기 스터디가 없으면 최신 모집중 스터디로 대체
     */
    public java.util.List<StudyListResponse> findPopularStudies(int limit) {
        java.util.List<Study> popularStudies = studyRepository.findPopularStudies(Pageable.ofSize(limit));

        // Fallback: 인기 스터디가 없으면 최신 모집중 스터디로 대체
        if (popularStudies.isEmpty()) {
            return studyRepository.findRecentRecruitingStudies(Pageable.ofSize(limit))
                    .stream()
                    .map(StudyListResponse::from)
                    .toList();
        }

        return popularStudies.stream()
                .map(StudyListResponse::from)
                .toList();
    }

    /**
     * 인기 스터디 조회 - 페이지네이션 (충원율 높은 순)
     */
    public Page<StudyListResponse> findPopularStudiesPaginated(Pageable pageable) {
        Page<Study> popularStudies = studyRepository.findPopularStudiesPaginated(pageable);

        // Fallback: 결과가 없으면 최신 모집중 스터디로 대체
        if (popularStudies.isEmpty()) {
            return studyRepository.findByStatusWithLeader(StudyStatus.RECRUITING, pageable)
                    .map(StudyListResponse::from);
        }

        return popularStudies.map(StudyListResponse::from);
    }

    /**
     * 근처 스터디 검색 - 페이지네이션 (위치 기반)
     */
    public Page<StudyListResponse> findNearbyStudiesPaginated(Double latitude, Double longitude, Double radiusKm, Pageable pageable) {
        Page<Study> nearbyStudies = studyRepository.findNearbyStudiesPaginated(latitude, longitude, radiusKm, pageable);

        // Fallback: 근처 스터디가 없으면 모집중인 최신 스터디로 대체
        if (nearbyStudies.isEmpty()) {
            return studyRepository.findByStatusWithLeader(StudyStatus.RECRUITING, pageable)
                    .map(StudyListResponse::from);
        }

        // Native query 결과에서 leader와 category를 별도로 조회
        java.util.List<Long> studyIds = nearbyStudies.getContent().stream()
                .map(Study::getId)
                .toList();

        if (studyIds.isEmpty()) {
            return nearbyStudies.map(StudyListResponse::from);
        }

        // JOIN FETCH로 연관 엔티티 함께 조회
        java.util.List<Study> studiesWithDetails = studyRepository.findByIdsWithLeaderAndCategory(studyIds);
        java.util.Map<Long, Study> studyMap = studiesWithDetails.stream()
                .collect(java.util.stream.Collectors.toMap(Study::getId, s -> s));

        java.util.List<StudyListResponse> content = nearbyStudies.getContent().stream()
                .map(s -> studyMap.getOrDefault(s.getId(), s))
                .map(StudyListResponse::from)
                .toList();

        return new org.springframework.data.domain.PageImpl<>(content, pageable, nearbyStudies.getTotalElements());
    }

    /**
     * 스터디 수정 (리더만 가능) - 전체 필드 지원
     */
    @Transactional
    public StudyResponse updateStudy(Long studyId, Long userId, StudyUpdateRequest request) {
        Study study = studyRepository.findByIdWithDetails(studyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));

        // 리더 권한 확인
        validateLeaderPermission(study, userId);

        // 카테고리 처리
        StudyCategory category = null;
        if (request.categoryId() != null) {
            category = studyCategoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));
        }

        StudySubcategory subcategory = null;
        if (request.subcategoryId() != null) {
            subcategory = studySubcategoryRepository.findById(request.subcategoryId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.SUBCATEGORY_NOT_FOUND));
            if (category != null && !subcategory.getCategory().getId().equals(category.getId())) {
                throw new BusinessException(ErrorCode.SUBCATEGORY_NOT_IN_CATEGORY);
            }
        }

        // daysOfWeek 리스트를 콤마 구분 문자열로 변환
        String daysOfWeekJson = request.daysOfWeek() != null ?
                String.join(",", request.daysOfWeek()) : null;

        // 커버 이미지 변경 시 기존 파일 삭제
        deleteOldCoverImageIfChanged(study.getCoverImageUrl(), request.coverImageUrl());

        // 전체 필드 업데이트
        study.updateFull(
                request.title(),
                request.description(),
                category,
                subcategory,
                request.coverImageUrl(),
                request.targetAudience(),
                request.goals(),
                request.studyMethod(),
                daysOfWeekJson,
                request.time(),
                request.durationType(),
                request.platform(),
                request.meetingRegion(),
                request.meetingCity(),
                request.meetingLatitude(),
                request.meetingLongitude(),
                request.maxMembers(),
                request.deposit(),
                request.depositRefundPolicy(),
                request.requirements()
        );

        // 태그, 규칙 업데이트 (있으면 교체)
        // 커리큘럼은 회차 정보가 연결되어 있으므로 별도 API로만 관리
        // orphanRemoval과 unique constraint 충돌 방지를 위해 먼저 clear 후 flush
        boolean needsFlush = false;
        if (request.tags() != null) {
            study.clearTags();
            needsFlush = true;
        }
        if (request.rules() != null) {
            study.clearRules();
            needsFlush = true;
        }

        // 삭제를 먼저 실행하여 unique constraint 충돌 방지
        if (needsFlush) {
            entityManager.flush();
        }

        // 새 데이터 추가
        if (request.tags() != null) {
            int order = 0;
            for (String tagName : request.tags()) {
                StudyTag tag = StudyTag.create(study, tagName, order++);
                study.addTag(tag);
            }
        }
        // 커리큘럼은 CurriculumService를 통해 별도 관리 (회차 보존)
        if (request.rules() != null) {
            for (RuleRequest rule : request.rules()) {
                StudyRule studyRule = StudyRule.create(study, rule.ruleOrder(), rule.content());
                study.addRule(studyRule);
            }
        }

        return StudyResponse.from(study);
    }

    /**
     * 스터디 시작 (모집 마감) - RECRUITING → IN_PROGRESS
     */
    @Transactional
    public void startStudy(Long studyId, Long userId) {
        Study study = findStudyEntityById(studyId);
        validateLeaderPermission(study, userId);
        study.start();
    }

    /**
     * 재모집 - IN_PROGRESS → RECRUITING (빈자리 있을 때만)
     */
    @Transactional
    public void reopenRecruitment(Long studyId, Long userId) {
        Study study = findStudyEntityById(studyId);
        validateLeaderPermission(study, userId);
        study.reopenRecruitment();
    }

    /**
     * 스터디 취소/폐쇄 (CLOSED 상태로 변경)
     */
    @Transactional
    public void closeStudy(Long studyId, Long userId) {
        Study study = findStudyEntityById(studyId);
        validateLeaderPermission(study, userId);
        study.close();
    }

    /**
     * 스터디 완료 - 모든 멤버에게 리뷰 요청 알림 생성
     */
    @Transactional
    public void completeStudy(Long studyId, Long userId) {
        Study study = findStudyEntityById(studyId);
        validateLeaderPermission(study, userId);
        study.complete();

        // 모든 멤버에게 리뷰 요청 알림 생성
        notificationService.createReviewRequestNotifications(study);
    }

    /**
     * 내부용: Entity 조회
     */
    public Study findStudyEntityById(Long studyId) {
        return studyRepository.findById(studyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));
    }

    /**
     * 리더 권한 검증
     */
    private void validateLeaderPermission(Study study, Long userId) {
        if (!study.getLeader().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.NOT_STUDY_LEADER);
        }
    }

    /**
     * 커버 이미지 변경 시 기존 파일 삭제
     */
    private void deleteOldCoverImageIfChanged(String oldUrl, String newUrl) {
        // 기존 URL이 없으면 스킵
        if (oldUrl == null || oldUrl.isBlank()) {
            return;
        }

        // file:// 로컬 URI는 서버에서 삭제 불가
        if (oldUrl.startsWith("file://")) {
            return;
        }

        // 새 URL이 없거나 기존과 동일하면 스킵
        if (newUrl == null || oldUrl.equals(newUrl)) {
            return;
        }

        // 기존 파일 삭제
        try {
            fileStorageService.delete(oldUrl);
            log.info("기존 커버 이미지 삭제: {}", oldUrl);
        } catch (Exception e) {
            log.warn("기존 커버 이미지 삭제 실패: {}", oldUrl, e);
        }
    }
}
