package com.wiedu.repository.study;

import com.wiedu.domain.entity.StudyCurriculum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudyCurriculumRepository extends JpaRepository<StudyCurriculum, Long> {
    List<StudyCurriculum> findByStudyIdOrderByWeekNumber(Long studyId);
    void deleteAllByStudyId(Long studyId);
}
