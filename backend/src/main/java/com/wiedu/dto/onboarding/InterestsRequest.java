package com.wiedu.dto.onboarding;

import com.wiedu.domain.enums.InterestType;
import lombok.Getter;

import java.util.List;

@Getter
public class InterestsRequest {
    private List<InterestType> interests;
}
