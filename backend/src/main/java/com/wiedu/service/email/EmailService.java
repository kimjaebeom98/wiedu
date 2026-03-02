package com.wiedu.service.email;

import com.wiedu.domain.entity.EmailVerificationCode;
import com.wiedu.exception.BusinessException;
import com.wiedu.exception.ErrorCode;
import com.wiedu.repository.auth.EmailVerificationCodeRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EmailService {

    private final JavaMailSender mailSender;
    private final EmailVerificationCodeRepository verificationCodeRepository;

    private static final int CODE_LENGTH = 6;
    private static final int EXPIRATION_MINUTES = 5;

    /**
     * 인증 코드 생성 및 이메일 발송
     */
    @Transactional
    public void sendVerificationCode(String email) {
        // 기존 미인증 코드 삭제
        verificationCodeRepository.deleteUnverifiedByEmail(email);

        // 새 인증 코드 생성
        String code = generateCode();

        // DB에 저장
        EmailVerificationCode verificationCode = EmailVerificationCode.builder()
                .email(email)
                .code(code)
                .expirationMinutes(EXPIRATION_MINUTES)
                .build();
        verificationCodeRepository.save(verificationCode);

        // 이메일 발송
        sendEmail(email, code);

        log.info("Verification code sent to: {}", email);
    }

    /**
     * 인증 코드 검증
     */
    @Transactional
    public boolean verifyCode(String email, String code) {
        EmailVerificationCode verificationCode = verificationCodeRepository
                .findLatestValidCode(email, LocalDateTime.now())
                .orElseThrow(() -> new BusinessException(ErrorCode.VERIFICATION_CODE_NOT_FOUND));

        if (!verificationCode.isValid(code)) {
            if (verificationCode.isExpired()) {
                throw new BusinessException(ErrorCode.VERIFICATION_CODE_EXPIRED);
            }
            throw new BusinessException(ErrorCode.VERIFICATION_CODE_INVALID);
        }

        // 인증 완료 표시
        verificationCode.markAsVerified();

        log.info("Email verified: {}", email);
        return true;
    }

    /**
     * 이메일 인증 여부 확인
     */
    public boolean isEmailVerified(String email) {
        return verificationCodeRepository.findByEmailAndVerifiedTrue(email).isPresent();
    }

    /**
     * 6자리 숫자 코드 생성
     */
    private String generateCode() {
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }

    /**
     * 인증 이메일 발송
     */
    private void sendEmail(String to, String code) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("[위듀] 이메일 인증 코드");
            helper.setText(buildEmailContent(code), true);

            mailSender.send(message);
        } catch (MessagingException e) {
            log.error("Failed to send email to: {}", to, e);
            throw new BusinessException(ErrorCode.EMAIL_SEND_FAILED);
        }
    }

    /**
     * 이메일 HTML 내용 생성
     */
    private String buildEmailContent(String code) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; }
                    .container { max-width: 400px; margin: 0 auto; padding: 40px 20px; }
                    .logo { font-size: 24px; font-weight: bold; color: #8B5CF6; margin-bottom: 20px; }
                    .code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #18181B; background: #F4F4F5; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0; }
                    .text { color: #71717A; font-size: 14px; line-height: 1.6; }
                    .footer { margin-top: 30px; font-size: 12px; color: #A1A1AA; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">wi<span style="color:#A78BFA">edu</span></div>
                    <p class="text">안녕하세요! 위듀 회원가입을 위한 인증 코드입니다.</p>
                    <div class="code">%s</div>
                    <p class="text">이 코드는 5분 동안만 유효합니다.<br>본인이 요청하지 않은 경우 이 이메일을 무시해주세요.</p>
                    <div class="footer">© 2024 wiedu. All rights reserved.</div>
                </div>
            </body>
            </html>
            """.formatted(code);
    }
}
