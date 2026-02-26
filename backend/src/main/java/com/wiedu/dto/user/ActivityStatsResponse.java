package com.wiedu.dto.user;

public record ActivityStatsResponse(
        int activeStudyCount,      // 참여 중인 스터디
        int completedStudyCount,   // 완료한 스터디
        int leadingStudyCount,     // 운영 중인 스터디
        int attendanceRate         // 출석률 (%)
) {}
