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
}
