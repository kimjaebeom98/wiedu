package com.wiedu.service.user;

import com.wiedu.domain.entity.User;
import com.wiedu.domain.entity.UserCategoryTemperature;
import com.wiedu.domain.enums.InterestType;
import com.wiedu.dto.user.CategoryTemperatureResponse;
import com.wiedu.repository.user.UserCategoryTemperatureRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryTemperatureService {

    private final UserService userService;
    private final UserCategoryTemperatureRepository categoryTemperatureRepository;

    /**
     * 유저의 카테고리별 온도 조회
     */
    public List<CategoryTemperatureResponse> getCategoryTemperatures(Long userId) {
        User user = userService.findUserEntityById(userId);
        return categoryTemperatureRepository.findByUser(user).stream()
                .map(ct -> CategoryTemperatureResponse.of(ct.getCategory(), ct.getTemperature(), ct.getStudyCount()))
                .toList();
    }

    /**
     * 상위 N개 카테고리 조회
     */
    public List<CategoryTemperatureResponse> getTopCategories(Long userId, int limit) {
        User user = userService.findUserEntityById(userId);
        List<UserCategoryTemperature> all = categoryTemperatureRepository
                .findByUser(user)
                .stream()
                .sorted((a, b) -> b.getTemperature().compareTo(a.getTemperature()))
                .limit(limit)
                .toList();
        return all.stream()
                .map(ct -> CategoryTemperatureResponse.of(ct.getCategory(), ct.getTemperature(), ct.getStudyCount()))
                .toList();
    }

    /**
     * 온도 증가 (스터디 참여 시 호출)
     */
    @Transactional
    public void increaseTemperature(Long userId, InterestType category, BigDecimal amount) {
        User user = userService.findUserEntityById(userId);
        UserCategoryTemperature ct = categoryTemperatureRepository
                .findByUserAndCategory(user, category)
                .orElseGet(() -> {
                    UserCategoryTemperature newCt = UserCategoryTemperature.create(user, category);
                    return categoryTemperatureRepository.save(newCt);
                });
        ct.increaseTemperature(amount);
        categoryTemperatureRepository.save(ct);
        log.info("카테고리 온도 증가: userId={}, category={}, amount={}, newTemp={}",
                userId, category, amount, ct.getTemperature());
    }
}
