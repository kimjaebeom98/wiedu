package com.wiedu.repository.user;

import com.wiedu.domain.entity.User;
import com.wiedu.domain.entity.UserCategoryTemperature;
import com.wiedu.domain.enums.InterestType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserCategoryTemperatureRepository extends JpaRepository<UserCategoryTemperature, Long> {

    List<UserCategoryTemperature> findByUser(User user);

    Optional<UserCategoryTemperature> findByUserAndCategory(User user, InterestType category);

    List<UserCategoryTemperature> findTop3ByUserOrderByTemperatureDesc(User user);
}
