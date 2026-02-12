package com.wiedu.dto.onboarding;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class TermsAgreementRequest {
    @NotNull(message = "이용약관 동의는 필수입니다")
    private Boolean termsAgreed;

    @NotNull(message = "개인정보처리방침 동의는 필수입니다")
    private Boolean privacyAgreed;

    private Boolean marketingAgreed = false;
}
