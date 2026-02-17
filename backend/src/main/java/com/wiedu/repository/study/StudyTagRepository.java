package com.wiedu.repository.study;

import com.wiedu.domain.entity.StudyTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudyTagRepository extends JpaRepository<StudyTag, Long> {
    List<StudyTag> findByStudyIdOrderBySortOrder(Long studyId);
    void deleteAllByStudyId(Long studyId);
}
