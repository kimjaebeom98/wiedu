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

        // 1. 어학 (12개)
        categoryMap.put(
            new CategoryInfo("LANGUAGE", "어학", "🌏"),
            List.of("토익", "토플", "OPIC", "영어회화", "일본어", "중국어",
                    "독일어", "프랑스어", "스페인어", "베트남어", "HSK", "JLPT")
        );

        // 2. 취업/이직 (6개)
        categoryMap.put(
            new CategoryInfo("CAREER", "취업/이직", "💼"),
            List.of("자소서 첨삭", "면접 스터디", "포트폴리오", "이력서", "인적성검사", "직무분석")
        );

        // 3. IT/개발 (11개)
        categoryMap.put(
            new CategoryInfo("IT_DEV", "IT/개발", "💻"),
            List.of("코딩테스트", "프론트엔드", "백엔드", "AI/ML", "모바일",
                    "DevOps", "보안", "데이터분석", "클라우드", "블록체인", "게임개발")
        );

        // 4. 자격증 (10개)
        categoryMap.put(
            new CategoryInfo("CERTIFICATION", "자격증", "📜"),
            List.of("정보처리기사", "전기기사", "건축기사", "공인중개사", "컴활",
                    "SQLD", "빅데이터분석기사", "사회복지사", "AWS", "토익스피킹")
        );

        // 5. 공무원/고시 (10개)
        categoryMap.put(
            new CategoryInfo("CIVIL_SERVICE", "공무원/고시", "🏛️"),
            List.of("9급", "7급", "경찰", "소방", "군무원",
                    "세무직", "법원직", "변호사", "세무사", "공인회계사")
        );

        // 6. 재테크 (6개)
        categoryMap.put(
            new CategoryInfo("FINANCE", "재테크", "📈"),
            List.of("주식", "부동산", "가상자산", "경제공부", "펀드", "재무설계")
        );

        // 7. 디자인 (8개)
        categoryMap.put(
            new CategoryInfo("DESIGN", "디자인", "🎨"),
            List.of("UI/UX", "그래픽", "영상편집", "포토샵", "일러스트", "3D모델링", "모션그래픽", "피그마")
        );

        // 8. 비즈니스 (8개)
        categoryMap.put(
            new CategoryInfo("BUSINESS", "비즈니스", "🚀"),
            List.of("창업", "마케팅", "PM", "기획", "브랜딩", "데이터분석", "커뮤니케이션", "리더십")
        );

        // 9. 학습/교육 (6개) - 신규
        categoryMap.put(
            new CategoryInfo("EDUCATION", "학습/교육", "📚"),
            List.of("수능", "내신", "논술", "독서", "글쓰기", "수학")
        );

        // 10. 라이프스타일 (6개) - 신규
        categoryMap.put(
            new CategoryInfo("LIFESTYLE", "라이프스타일", "🧘"),
            List.of("다이어트", "운동", "습관형성", "자기계발", "명상", "독서모임")
        );

        // 11. 콘텐츠/창작 (6개) - 신규
        categoryMap.put(
            new CategoryInfo("CONTENT", "콘텐츠/창작", "📹"),
            List.of("유튜브", "블로그", "SNS마케팅", "글쓰기", "작곡", "팟캐스트")
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
            // 어학
            Map.entry("토익", "TOEIC"),
            Map.entry("토플", "TOEFL"),
            Map.entry("영어회화", "ENG_CONV"),
            Map.entry("일본어", "JAPANESE"),
            Map.entry("중국어", "CHINESE"),
            Map.entry("독일어", "GERMAN"),
            Map.entry("프랑스어", "FRENCH"),
            Map.entry("스페인어", "SPANISH"),
            Map.entry("베트남어", "VIETNAMESE"),
            // 취업/이직
            Map.entry("자소서 첨삭", "RESUME"),
            Map.entry("면접 스터디", "INTERVIEW"),
            Map.entry("포트폴리오", "PORTFOLIO"),
            Map.entry("이력서", "CV"),
            Map.entry("인적성검사", "APTITUDE"),
            Map.entry("직무분석", "JOB_ANALYSIS"),
            // IT/개발
            Map.entry("코딩테스트", "CODING_TEST"),
            Map.entry("프론트엔드", "FRONTEND"),
            Map.entry("백엔드", "BACKEND"),
            Map.entry("모바일", "MOBILE"),
            Map.entry("보안", "SECURITY"),
            Map.entry("데이터분석", "DATA_ANALYSIS"),
            Map.entry("클라우드", "CLOUD"),
            Map.entry("블록체인", "BLOCKCHAIN"),
            Map.entry("게임개발", "GAME_DEV"),
            // 자격증
            Map.entry("정보처리기사", "ENGINEER"),
            Map.entry("전기기사", "ELECTRICAL"),
            Map.entry("건축기사", "ARCHITECT"),
            Map.entry("공인중개사", "REALTOR"),
            Map.entry("컴활", "COMPUTER"),
            Map.entry("빅데이터분석기사", "BIG_DATA"),
            Map.entry("사회복지사", "SOCIAL_WORKER"),
            Map.entry("토익스피킹", "TOEIC_SPEAKING"),
            // 공무원/고시
            Map.entry("경찰", "POLICE"),
            Map.entry("소방", "FIREFIGHTER"),
            Map.entry("군무원", "MILITARY"),
            Map.entry("세무직", "TAX_OFFICER"),
            Map.entry("법원직", "COURT"),
            Map.entry("변호사", "LAWYER"),
            Map.entry("세무사", "TAX_ACCOUNTANT"),
            Map.entry("공인회계사", "CPA"),
            // 재테크
            Map.entry("주식", "STOCK"),
            Map.entry("부동산", "REAL_ESTATE"),
            Map.entry("가상자산", "CRYPTO"),
            Map.entry("경제공부", "ECONOMICS"),
            Map.entry("펀드", "FUND"),
            Map.entry("재무설계", "FINANCIAL_PLANNING"),
            // 디자인
            Map.entry("그래픽", "GRAPHIC"),
            Map.entry("영상편집", "VIDEO"),
            Map.entry("포토샵", "PHOTOSHOP"),
            Map.entry("일러스트", "ILLUSTRATOR"),
            Map.entry("3D모델링", "3D_MODELING"),
            Map.entry("모션그래픽", "MOTION_GRAPHIC"),
            Map.entry("피그마", "FIGMA"),
            // 비즈니스
            Map.entry("창업", "STARTUP"),
            Map.entry("마케팅", "MARKETING"),
            Map.entry("기획", "PLANNING"),
            Map.entry("브랜딩", "BRANDING"),
            Map.entry("커뮤니케이션", "COMMUNICATION"),
            Map.entry("리더십", "LEADERSHIP"),
            // 학습/교육
            Map.entry("수능", "CSAT"),
            Map.entry("내신", "SCHOOL_GRADE"),
            Map.entry("논술", "ESSAY"),
            Map.entry("독서", "READING"),
            Map.entry("글쓰기", "WRITING"),
            Map.entry("수학", "MATH"),
            // 라이프스타일
            Map.entry("다이어트", "DIET"),
            Map.entry("운동", "EXERCISE"),
            Map.entry("습관형성", "HABIT"),
            Map.entry("자기계발", "SELF_DEV"),
            Map.entry("명상", "MEDITATION"),
            Map.entry("독서모임", "BOOK_CLUB"),
            // 콘텐츠/창작
            Map.entry("유튜브", "YOUTUBE"),
            Map.entry("블로그", "BLOG"),
            Map.entry("SNS마케팅", "SNS_MARKETING"),
            Map.entry("작곡", "COMPOSE"),
            Map.entry("팟캐스트", "PODCAST")
        );

        String code = koreanMapping.getOrDefault(subName, normalized);
        return categoryCode + "_" + code;
    }

    private record CategoryInfo(String code, String name, String icon) {}
}
