package com.wiedu.repository.study;

import com.wiedu.domain.entity.StudyRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudyRuleRepository extends JpaRepository<StudyRule, Long> {
    List<StudyRule> findByStudyIdOrderByRuleOrder(Long studyId);
    void deleteAllByStudyId(Long studyId);
}
