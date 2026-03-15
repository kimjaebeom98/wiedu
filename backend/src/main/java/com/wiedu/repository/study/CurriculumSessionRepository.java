package com.wiedu.repository.study;

import com.wiedu.domain.entity.CurriculumSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CurriculumSessionRepository extends JpaRepository<CurriculumSession, Long> {

    List<CurriculumSession> findByCurriculumIdOrderBySessionNumber(Long curriculumId);

    @Query("SELECT COUNT(s) FROM CurriculumSession s WHERE s.curriculum.id = :curriculumId")
    int countByCurriculumId(Long curriculumId);

    @Modifying
    @Query("DELETE FROM CurriculumSession s WHERE s.curriculum.id = :curriculumId")
    void deleteAllByCurriculumId(Long curriculumId);

    @Query("SELECT s FROM CurriculumSession s WHERE s.curriculum.study.id = :studyId ORDER BY s.curriculum.weekNumber, s.sessionNumber")
    List<CurriculumSession> findAllByStudyId(Long studyId);
}
