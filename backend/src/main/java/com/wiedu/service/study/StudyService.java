package com.wiedu.service.study;

import com.wiedu.domain.entity.Study;
import com.wiedu.domain.entity.StudyMember;
import com.wiedu.domain.entity.User;
import com.wiedu.domain.enums.MemberRole;
import com.wiedu.domain.enums.StudyCategory;
import com.wiedu.domain.enums.StudyStatus;
import com.wiedu.dto.study.StudyCreateRequest;
import com.wiedu.dto.study.StudyUpdateRequest;
import com.wiedu.dto.study.StudyListResponse;
import com.wiedu.dto.study.StudyResponse;
import com.wiedu.exception.BusinessException;
import com.wiedu.exception.ErrorCode;
import com.wiedu.repository.study.StudyMemberRepository;
import com.wiedu.repository.study.StudyRepository;
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
    private final UserService userService;

    /**
     * 스터디 생성
     */
    @Transactional
    public StudyResponse createStudy(Long leaderId, StudyCreateRequest request) {
        User leader = userService.findUserEntityById(leaderId);

        Study study = Study.builder()
                .title(request.title())
                .description(request.description())
                .category(request.category())
                .leader(leader)
                .maxMembers(request.maxMembers())
                .region(request.region())
                .detailedLocation(request.detailedLocation())
                .online(request.online())
                .schedule(request.schedule())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .build();

        Study savedStudy = studyRepository.save(study);

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
        Study study = studyRepository.findByIdWithLeader(studyId)
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
    public Page<StudyListResponse> findByCategory(StudyCategory category, Pageable pageable) {
        return studyRepository.findByCategoryWithLeader(category, pageable)
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
                request.description() != null ? request.description() : study.getDescription(),
                request.schedule() != null ? request.schedule() : study.getSchedule()
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
