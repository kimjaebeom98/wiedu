package com.wiedu.controller.auth;

import com.wiedu.service.email.EmailService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
public class EmailVerificationController {

    private final EmailService emailService;

    /**
     * 인증 코드 발송
     */
    @PostMapping("/send-code")
    public ResponseEntity<SendCodeResponse> sendVerificationCode(
            @Valid @RequestBody SendCodeRequest request) {
        emailService.sendVerificationCode(request.email());
        return ResponseEntity.ok(new SendCodeResponse("인증 코드가 발송되었습니다."));
    }

    /**
     * 인증 코드 확인
     */
    @PostMapping("/verify-code")
    public ResponseEntity<VerifyCodeResponse> verifyCode(
            @Valid @RequestBody VerifyCodeRequest request) {
        boolean verified = emailService.verifyCode(request.email(), request.code());
        return ResponseEntity.ok(new VerifyCodeResponse(verified, "이메일 인증이 완료되었습니다."));
    }

    /**
     * 이메일 인증 상태 확인
     */
    @GetMapping("/verified")
    public ResponseEntity<VerifiedStatusResponse> isEmailVerified(
            @RequestParam @Email @NotBlank String email) {
        boolean verified = emailService.isEmailVerified(email);
        return ResponseEntity.ok(new VerifiedStatusResponse(verified));
    }

    // Request/Response Records
    public record SendCodeRequest(
            @Email(message = "올바른 이메일 형식이 아닙니다.")
            @NotBlank(message = "이메일은 필수입니다.")
            String email
    ) {}

    public record SendCodeResponse(String message) {}

    public record VerifyCodeRequest(
            @Email(message = "올바른 이메일 형식이 아닙니다.")
            @NotBlank(message = "이메일은 필수입니다.")
            String email,
            @NotBlank(message = "인증 코드는 필수입니다.")
            String code
    ) {}

    public record VerifyCodeResponse(boolean verified, String message) {}

    public record VerifiedStatusResponse(boolean verified) {}
}
