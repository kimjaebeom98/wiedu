package com.wiedu.repository.study;

import com.wiedu.domain.entity.Study;
import com.wiedu.domain.entity.StudyBookmark;
import com.wiedu.domain.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudyBookmarkRepository extends JpaRepository<StudyBookmark, Long> {

    /**
     * 사용자와 스터디로 북마크 조회
     */
    Optional<StudyBookmark> findByUserAndStudy(User user, Study study);

    /**
     * 사용자와 스터디 ID로 북마크 조회
     */
    @Query("SELECT sb FROM StudyBookmark sb WHERE sb.user.id = :userId AND sb.study.id = :studyId")
    Optional<StudyBookmark> findByUserIdAndStudyId(@Param("userId") Long userId, @Param("studyId") Long studyId);

    /**
     * 북마크 여부 확인
     */
    boolean existsByUserAndStudy(User user, Study study);

    /**
     * 사용자 ID와 스터디 ID로 북마크 여부 확인
     */
    @Query("SELECT CASE WHEN COUNT(sb) > 0 THEN true ELSE false END FROM StudyBookmark sb WHERE sb.user.id = :userId AND sb.study.id = :studyId")
    boolean existsByUserIdAndStudyId(@Param("userId") Long userId, @Param("studyId") Long studyId);

    /**
     * 사용자의 북마크 목록 조회 (페이징)
     */
    @Query("SELECT sb FROM StudyBookmark sb JOIN FETCH sb.study s WHERE sb.user.id = :userId ORDER BY sb.createdAt DESC")
    Page<StudyBookmark> findByUserIdWithStudy(@Param("userId") Long userId, Pageable pageable);

    /**
     * 사용자의 모든 북마크 스터디 ID 목록
     */
    @Query("SELECT sb.study.id FROM StudyBookmark sb WHERE sb.user.id = :userId")
    List<Long> findStudyIdsByUserId(@Param("userId") Long userId);

    /**
     * 사용자의 북마크 개수
     */
    long countByUserId(Long userId);

    /**
     * 스터디의 북마크 개수
     */
    long countByStudyId(Long studyId);

    /**
     * 북마크 삭제
     */
    void deleteByUserAndStudy(User user, Study study);

    /**
     * 사용자 ID와 스터디 ID로 북마크 삭제
     */
    @Query("DELETE FROM StudyBookmark sb WHERE sb.user.id = :userId AND sb.study.id = :studyId")
    void deleteByUserIdAndStudyId(@Param("userId") Long userId, @Param("studyId") Long studyId);
}
