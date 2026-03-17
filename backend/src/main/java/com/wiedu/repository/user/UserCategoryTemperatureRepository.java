package com.wiedu.repository.user;

import com.wiedu.domain.entity.User;
import com.wiedu.domain.entity.UserCategoryTemperature;
import com.wiedu.domain.enums.InterestType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserCategoryTemperatureRepository extends JpaRepository<UserCategoryTemperature, Long> {

    List<UserCategoryTemperature> findByUser(User user);

    Optional<UserCategoryTemperature> findByUserAndCategory(User user, InterestType category);

    List<UserCategoryTemperature> findTop3ByUserOrderByTemperatureDesc(User user);

    /**
     * 사용자 삭제 시 해당 사용자의 모든 카테고리 온도 삭제
     */
    @Modifying
    @Query("DELETE FROM UserCategoryTemperature uct WHERE uct.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
