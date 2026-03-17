package com.wiedu.repository.user;

import com.wiedu.domain.entity.User;
import com.wiedu.domain.entity.UserStudyPreference;
import com.wiedu.domain.enums.StudyType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserStudyPreferenceRepository extends JpaRepository<UserStudyPreference, Long> {

    List<UserStudyPreference> findByUser(User user);

    List<UserStudyPreference> findByUserId(Long userId);

    boolean existsByUserAndStudyType(User user, StudyType studyType);

    @Modifying
    @Query("DELETE FROM UserStudyPreference usp WHERE usp.user = :user")
    void deleteAllByUser(@Param("user") User user);

    @Modifying
    @Query("DELETE FROM UserStudyPreference usp WHERE usp.user.id = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);

    /**
     * 사용자 삭제 시 해당 사용자의 모든 스터디 선호도 삭제 (alias)
     */
    @Modifying
    @Query("DELETE FROM UserStudyPreference usp WHERE usp.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
