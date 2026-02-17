package com.wiedu.config;

import com.wiedu.domain.entity.StudyCategory;
import com.wiedu.domain.entity.StudySubcategory;
import com.wiedu.repository.study.StudyCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 스터디 카테고리 초기 데이터 설정
 * 애플리케이션 시작 시 카테고리/서브카테고리가 없으면 자동 생성
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StudyCategoryInitializer implements CommandLineRunner {

    private final StudyCategoryRepository categoryRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (categoryRepository.count() > 0) {
            log.info("스터디 카테고리가 이미 존재합니다. 초기화를 건너뜁니다.");
            return;
        }

        log.info("스터디 카테고리 초기 데이터를 생성합니다...");
        initializeCategories();
        log.info("스터디 카테고리 초기화 완료!");
    }

    private void initializeCategories() {
        // 대분류 → 중분류 매핑 (순서 유지를 위해 LinkedHashMap 사용)
        Map<CategoryInfo, List<String>> categoryMap = new LinkedHashMap<>();

        categoryMap.put(
            new CategoryInfo("LANGUAGE", "어학", "🌏"),
            List.of("토익", "토플", "OPIC", "영어회화", "일본어", "중국어")
        );

        categoryMap.put(
            new CategoryInfo("CAREER", "취업/이직", "💼"),
            List.of("자소서 첨삭", "면접 스터디", "포트폴리오")
        );

        categoryMap.put(
            new CategoryInfo("IT_DEV", "IT/개발", "💻"),
            List.of("코딩테스트", "알고리즘", "프론트엔드", "백엔드", "AI/ML")
        );

        categoryMap.put(
            new CategoryInfo("CERTIFICATION", "자격증", "📜"),
            List.of("정보처리기사", "AWS", "컴활", "한국사", "CPA", "공인중개사")
        );

        categoryMap.put(
            new CategoryInfo("CIVIL_SERVICE", "공무원/고시", "🏛️"),
            List.of("7급", "9급", "경찰", "소방", "행정사")
        );

        categoryMap.put(
            new CategoryInfo("FINANCE", "재테크", "📈"),
            List.of("주식", "부동산", "가상자산", "경제공부")
        );

        categoryMap.put(
            new CategoryInfo("DESIGN", "디자인", "🎨"),
            List.of("UI/UX", "그래픽", "영상편집", "포토샵")
        );

        categoryMap.put(
            new CategoryInfo("BUSINESS", "비즈니스", "🚀"),
            List.of("창업", "마케팅", "PM", "기획")
        );

        int categoryOrder = 0;
        for (Map.Entry<CategoryInfo, List<String>> entry : categoryMap.entrySet()) {
            CategoryInfo info = entry.getKey();
            List<String> subcategoryNames = entry.getValue();

            StudyCategory category = StudyCategory.create(
                info.code(),
                info.name(),
                info.icon(),
                categoryOrder++
            );

            int subOrder = 0;
            for (String subName : subcategoryNames) {
                String subCode = generateSubcategoryCode(info.code(), subName);
                StudySubcategory subcategory = StudySubcategory.create(
                    category,
                    subCode,
                    subName,
                    subOrder++
                );
                category.addSubcategory(subcategory);
            }

            categoryRepository.save(category);
            log.debug("카테고리 생성: {} ({} 개의 서브카테고리)", info.name(), subcategoryNames.size());
        }
    }

    /**
     * 서브카테고리 코드 생성 (대분류코드_영문변환)
     */
    private String generateSubcategoryCode(String categoryCode, String subName) {
        String normalized = subName
            .toUpperCase()
            .replace("/", "_")
            .replace(" ", "_")
            .replace(".", "");

        // 한글인 경우 음역 처리
        Map<String, String> koreanMapping = Map.ofEntries(
            Map.entry("토익", "TOEIC"),
            Map.entry("토플", "TOEFL"),
            Map.entry("영어회화", "ENG_CONV"),
            Map.entry("일본어", "JAPANESE"),
            Map.entry("중국어", "CHINESE"),
            Map.entry("자소서 첨삭", "RESUME"),
            Map.entry("면접 스터디", "INTERVIEW"),
            Map.entry("포트폴리오", "PORTFOLIO"),
            Map.entry("코딩테스트", "CODING_TEST"),
            Map.entry("알고리즘", "ALGORITHM"),
            Map.entry("프론트엔드", "FRONTEND"),
            Map.entry("백엔드", "BACKEND"),
            Map.entry("정보처리기사", "ENGINEER"),
            Map.entry("컴활", "COMPUTER"),
            Map.entry("한국사", "KOREAN_HISTORY"),
            Map.entry("공인중개사", "REALTOR"),
            Map.entry("경찰", "POLICE"),
            Map.entry("소방", "FIREFIGHTER"),
            Map.entry("행정사", "ADMIN"),
            Map.entry("주식", "STOCK"),
            Map.entry("부동산", "REAL_ESTATE"),
            Map.entry("가상자산", "CRYPTO"),
            Map.entry("경제공부", "ECONOMICS"),
            Map.entry("그래픽", "GRAPHIC"),
            Map.entry("영상편집", "VIDEO"),
            Map.entry("포토샵", "PHOTOSHOP"),
            Map.entry("창업", "STARTUP"),
            Map.entry("마케팅", "MARKETING"),
            Map.entry("기획", "PLANNING")
        );

        String code = koreanMapping.getOrDefault(subName, normalized);
        return categoryCode + "_" + code;
    }

    private record CategoryInfo(String code, String name, String icon) {}
}
