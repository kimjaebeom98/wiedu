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
import com.wiedu.domain.enums.StudyStatus;
import com.wiedu.dto.study.CurriculumRequest;
import com.wiedu.dto.study.RuleRequest;
import com.wiedu.dto.study.StudyCreateRequest;
import com.wiedu.dto.study.StudyUpdateRequest;
import com.wiedu.dto.study.StudyListResponse;
import com.wiedu.dto.study.StudyResponse;
import com.wiedu.exception.BusinessException;
import com.wiedu.exception.ErrorCode;
import com.wiedu.repository.study.StudyCategoryRepository;
import com.wiedu.repository.study.StudyMemberRepository;
import com.wiedu.repository.study.StudyRepository;
import com.wiedu.repository.study.StudySubcategoryRepository;
import com.wiedu.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 스터디 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyService {

    private final StudyRepository studyRepository;
    private final StudyMemberRepository studyMemberRepository;
    private final StudyCategoryRepository studyCategoryRepository;
    private final StudySubcategoryRepository studySubcategoryRepository;
    private final UserService userService;

    /**
     * 스터디 생성 (6단계 플로우)
     */
    @Transactional
    public StudyResponse createStudy(Long leaderId, StudyCreateRequest request) {
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
                .startDate(request.startDate())
                .endDate(request.endDate())
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
     * 스터디 상세 조회 (N+1 방지)
     */
    public StudyResponse findById(Long studyId) {
        Study study = studyRepository.findByIdWithDetails(studyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));
        return StudyResponse.from(study);
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
     */
    public Page<StudyListResponse> findByCategory(Long categoryId, Pageable pageable) {
        return studyRepository.findByCategoryIdWithLeader(categoryId, pageable)
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
     * 키워드 검색 (N+1 방지)
     */
    public Page<StudyListResponse> searchByKeyword(String keyword, Pageable pageable) {
        return studyRepository.searchByKeywordWithLeader(keyword, pageable)
                .map(StudyListResponse::from);
    }

    /**
     * 스터디 수정 (리더만 가능)
     */
    @Transactional
    public StudyResponse updateStudy(Long studyId, Long userId, StudyUpdateRequest request) {
        Study study = findStudyEntityById(studyId);

        // 리더 권한 확인
        validateLeaderPermission(study, userId);

        study.updateInfo(
                request.title() != null ? request.title() : study.getTitle(),
                request.description() != null ? request.description() : study.getDescription()
        );

        return StudyResponse.from(study);
    }

    /**
     * 스터디 마감
     */
    @Transactional
    public void closeStudy(Long studyId, Long userId) {
        Study study = findStudyEntityById(studyId);
        validateLeaderPermission(study, userId);
        study.close();
    }

    /**
     * 스터디 완료
     */
    @Transactional
    public void completeStudy(Long studyId, Long userId) {
        Study study = findStudyEntityById(studyId);
        validateLeaderPermission(study, userId);
        study.complete();
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
}
