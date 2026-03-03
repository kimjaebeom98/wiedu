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
    private static final String FROM_EMAIL = "woqjadl6488@gmail.com";
    private static final String FROM_NAME = "위듀";

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

            helper.setFrom(FROM_EMAIL, FROM_NAME);
            helper.setTo(to);
            helper.setSubject("[위듀] 이메일 인증 코드");
            helper.setText(buildEmailContent(code), true);

            mailSender.send(message);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
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
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #F4F4F5;">
                <table width="100%%" cellpadding="0" cellspacing="0" style="background-color: #F4F4F5; padding: 40px 20px;">
                    <tr>
                        <td align="center">
                            <table width="100%%" cellpadding="0" cellspacing="0" style="max-width: 480px; background: linear-gradient(135deg, #18181B 0%%, #27272A 100%%); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.15);">
                                <!-- Header -->
                                <tr>
                                    <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #8B5CF6 0%%, #A78BFA 100%%);">
                                        <div style="font-size: 32px; font-weight: 800; color: #FFFFFF; letter-spacing: -1px;">
                                            wi<span style="color: #E9D5FF;">edu</span>
                                        </div>
                                        <div style="margin-top: 8px; font-size: 14px; color: rgba(255,255,255,0.8);">
                                            함께 성장하는 스터디 플랫폼
                                        </div>
                                    </td>
                                </tr>
                                <!-- Content -->
                                <tr>
                                    <td style="padding: 40px;">
                                        <div style="text-align: center; margin-bottom: 30px;">
                                            <div style="display: inline-block; width: 64px; height: 64px; background: linear-gradient(135deg, #8B5CF6 0%%, #A78BFA 100%%); border-radius: 50%%; line-height: 64px; font-size: 28px;">
                                                ✉️
                                            </div>
                                        </div>
                                        <h2 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: #FFFFFF; text-align: center;">
                                            이메일 인증 코드
                                        </h2>
                                        <p style="margin: 0 0 30px; font-size: 15px; color: #A1A1AA; text-align: center; line-height: 1.6;">
                                            아래 인증 코드를 입력하여<br>회원가입을 완료해 주세요.
                                        </p>
                                        <!-- Code Box -->
                                        <div style="background: linear-gradient(135deg, #3F3F46 0%%, #27272A 100%%); border: 2px solid #8B5CF6; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 30px;">
                                            <div style="font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #FFFFFF; font-family: 'SF Mono', 'Consolas', monospace;">
                                                %s
                                            </div>
                                        </div>
                                        <!-- Timer Info -->
                                        <div style="background: rgba(139, 92, 246, 0.1); border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 20px;">
                                            <span style="color: #A78BFA; font-size: 14px; font-weight: 600;">⏱️ 5분 후 만료</span>
                                        </div>
                                        <p style="margin: 0; font-size: 13px; color: #71717A; text-align: center; line-height: 1.6;">
                                            본인이 요청하지 않은 경우<br>이 이메일을 무시해 주세요.
                                        </p>
                                    </td>
                                </tr>
                                <!-- Footer -->
                                <tr>
                                    <td style="padding: 24px 40px; background: #18181B; border-top: 1px solid #27272A; text-align: center;">
                                        <p style="margin: 0; font-size: 12px; color: #52525B;">
                                            © 2024 wiedu. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """.formatted(code);
    }
}
