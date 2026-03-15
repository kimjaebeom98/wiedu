package com.wiedu.service.study;

import com.wiedu.domain.entity.Study;
import com.wiedu.domain.entity.StudyBookmark;
import com.wiedu.domain.entity.User;
import com.wiedu.dto.study.StudyResponse;
import com.wiedu.exception.BusinessException;
import com.wiedu.exception.ErrorCode;
import com.wiedu.repository.study.StudyBookmarkRepository;
import com.wiedu.repository.study.StudyRepository;
import com.wiedu.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyBookmarkService {

    private final StudyBookmarkRepository bookmarkRepository;
    private final StudyRepository studyRepository;
    private final UserRepository userRepository;

    /**
     * 스터디 북마크 추가
     */
    @Transactional
    public void addBookmark(Long studyId, Long userId) {
        // 이미 북마크했는지 확인
        if (bookmarkRepository.existsByUserIdAndStudyId(userId, studyId)) {
            throw new BusinessException(ErrorCode.ALREADY_BOOKMARKED);
        }

        Study study = studyRepository.findById(studyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        StudyBookmark bookmark = StudyBookmark.create(user, study);
        bookmarkRepository.save(bookmark);

        log.info("스터디 북마크 추가: userId={}, studyId={}", userId, studyId);
    }

    /**
     * 스터디 북마크 삭제
     */
    @Transactional
    public void removeBookmark(Long studyId, Long userId) {
        StudyBookmark bookmark = bookmarkRepository.findByUserIdAndStudyId(userId, studyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOOKMARK_NOT_FOUND));

        bookmarkRepository.delete(bookmark);

        log.info("스터디 북마크 삭제: userId={}, studyId={}", userId, studyId);
    }

    /**
     * 스터디 북마크 토글
     */
    @Transactional
    public boolean toggleBookmark(Long studyId, Long userId) {
        if (bookmarkRepository.existsByUserIdAndStudyId(userId, studyId)) {
            removeBookmark(studyId, userId);
            return false;
        } else {
            addBookmark(studyId, userId);
            return true;
        }
    }

    /**
     * 북마크 여부 확인
     */
    public boolean isBookmarked(Long studyId, Long userId) {
        return bookmarkRepository.existsByUserIdAndStudyId(userId, studyId);
    }

    /**
     * 내 북마크 목록 조회
     */
    public Page<StudyResponse> getMyBookmarks(Long userId, Pageable pageable) {
        return bookmarkRepository.findByUserIdWithStudy(userId, pageable)
                .map(bookmark -> StudyResponse.from(bookmark.getStudy()));
    }

    /**
     * 스터디 북마크 수 조회
     */
    public long getBookmarkCount(Long studyId) {
        return bookmarkRepository.countByStudyId(studyId);
    }
}
