package com.wiedu.domain.enums;

/**
 * 관심 분야 타입 (대분류 카테고리 기준)
 *
 * 카테고리 체계:
 * - LANGUAGE: 어학 (토익, 토플, OPIC, 영어회화, 일본어, 중국어)
 * - CAREER: 취업/이직 (자소서 첨삭, 면접 스터디, 포트폴리오)
 * - IT_DEV: IT/개발 (코딩테스트, 알고리즘, 프론트엔드, 백엔드, AI/ML)
 * - CERTIFICATION: 자격증 (정보처리기사, AWS, 컴활, 한국사, CPA, 공인중개사)
 * - CIVIL_SERVICE: 공무원/고시 (7급, 9급, 경찰, 소방, 행정사)
 * - FINANCE: 재테크 (주식, 부동산, 가상자산, 경제공부)
 * - DESIGN: 디자인 (UI/UX, 그래픽, 영상편집, 포토샵)
 * - BUSINESS: 비즈니스 (창업, 마케팅, PM, 기획)
 */
public enum InterestType {
    LANGUAGE,       // 어학
    CAREER,         // 취업/이직
    IT_DEV,         // IT/개발
    CERTIFICATION,  // 자격증
    CIVIL_SERVICE,  // 공무원/고시
    FINANCE,        // 재테크
    DESIGN,         // 디자인
    BUSINESS        // 비즈니스
}
