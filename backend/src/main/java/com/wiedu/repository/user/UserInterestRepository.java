package com.wiedu.repository.user;

import com.wiedu.domain.entity.User;
import com.wiedu.domain.entity.UserInterest;
import com.wiedu.domain.enums.InterestType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserInterestRepository extends JpaRepository<UserInterest, Long> {

    List<UserInterest> findByUser(User user);

    List<UserInterest> findByUserId(Long userId);

    boolean existsByUserAndInterestType(User user, InterestType interestType);

    @Modifying
    @Query("DELETE FROM UserInterest ui WHERE ui.user = :user")
    void deleteAllByUser(@Param("user") User user);

    @Modifying
    @Query("DELETE FROM UserInterest ui WHERE ui.user.id = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);
}
