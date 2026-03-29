package com.wiedu.oauth.callback;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.util.HtmlUtils;

import java.io.IOException;
import java.util.Set;

/**
 * OAuth 콜백 HTML 페이지 렌더러
 * 딥링크 리다이렉트 및 결과 페이지 생성
 */
@Component
public class OAuthCallbackRenderer {

    // 허용된 딥링크 스킴 (XSS 방지)
    private static final Set<String> ALLOWED_SCHEMES = Set.of("wiedu://", "exp://");

    /**
     * 딥링크 URL 검증 및 이스케이프
     * XSS 공격 방지를 위해 스킴 화이트리스트 검증 + HTML/JS 이스케이프
     */
    private String sanitizeDeepLinkUrl(String url) {
        if (url == null || url.isBlank()) {
            return "";
        }

        // 스킴 화이트리스트 검증
        String lowerUrl = url.toLowerCase();
        boolean validScheme = ALLOWED_SCHEMES.stream()
                .anyMatch(lowerUrl::startsWith);

        if (!validScheme) {
            return ""; // 허용되지 않은 스킴은 빈 문자열 반환
        }

        // HTML 속성용 이스케이프 (href 속성에 사용)
        return HtmlUtils.htmlEscape(url);
    }

    /**
     * JavaScript 문자열용 이스케이프
     */
    private String escapeForJavaScript(String url) {
        if (url == null || url.isBlank()) {
            return "";
        }
        // 작은따옴표, 백슬래시, 줄바꿈 이스케이프
        return url.replace("\\", "\\\\")
                  .replace("'", "\\'")
                  .replace("\"", "\\\"")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r");
    }

    /**
     * JavaScript를 사용한 딥링크 리다이렉트
     * HTTP 302는 커스텀 스킴(exp://)으로 리다이렉트할 수 없으므로 JavaScript 사용
     */
    public void sendDeepLinkRedirect(HttpServletResponse response, String deepLinkUrl) throws IOException {
        String safeHtmlUrl = sanitizeDeepLinkUrl(deepLinkUrl);
        String safeJsUrl = escapeForJavaScript(deepLinkUrl);

        response.setContentType("text/html;charset=UTF-8");
        String html = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\">" +
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
            "<title>wiedu 로그인</title>" +
            "<style>body{font-family:-apple-system,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#18181B;color:#fff;text-align:center;}" +
            ".container{padding:20px;}.btn{display:inline-block;padding:16px 32px;background:#8B5CF6;color:#fff;text-decoration:none;border-radius:12px;font-size:16px;margin-top:20px;}</style>" +
            "</head><body><div class=\"container\">" +
            "<h2>로그인 완료!</h2>" +
            "<p>앱으로 이동 중...</p>" +
            "<a class=\"btn\" href=\"" + safeHtmlUrl + "\">앱으로 이동하기</a>" +
            "</div>" +
            "<script>" +
            "setTimeout(function(){window.location.href='" + safeJsUrl + "';},100);" +
            "</script></body></html>";
        response.getWriter().write(html);
    }

    /**
     * 성공 페이지 + 딥링크 리다이렉트
     */
    public void sendSuccessPageWithDeepLink(HttpServletResponse response, String deepLinkUrl) throws IOException {
        String safeHtmlUrl = sanitizeDeepLinkUrl(deepLinkUrl);
        String safeJsUrl = escapeForJavaScript(deepLinkUrl);

        response.setContentType("text/html;charset=UTF-8");
        String html = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\">" +
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
            "<title>wiedu 로그인</title>" +
            "<style>body{font-family:-apple-system,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#18181B;color:#fff;text-align:center;}" +
            ".container{padding:20px;}.success{color:#22c55e;font-size:48px;margin-bottom:16px;}" +
            ".btn{display:inline-block;padding:16px 32px;background:#8B5CF6;color:#fff;text-decoration:none;border-radius:12px;font-size:16px;margin-top:20px;}" +
            ".info{color:#9CA3AF;font-size:14px;margin-top:16px;}</style>" +
            "</head><body><div class=\"container\">" +
            "<div class=\"success\">✓</div>" +
            "<h2>로그인 완료!</h2>" +
            "<p>앱으로 돌아가주세요.</p>" +
            "<a class=\"btn\" href=\"" + safeHtmlUrl + "\">앱으로 이동</a>" +
            "<p class=\"info\">자동으로 이동하지 않으면 버튼을 눌러주세요.</p>" +
            "</div>" +
            "<script>" +
            "setTimeout(function(){window.location.href='" + safeJsUrl + "';},500);" +
            "</script></body></html>";
        response.getWriter().write(html);
    }

    /**
     * 결과 페이지 표시
     */
    public void sendResultPage(HttpServletResponse response, boolean success, String message) throws IOException {
        response.setContentType("text/html;charset=UTF-8");
        String icon = success ? "✓" : "✕";
        String iconColor = success ? "#22c55e" : "#ef4444";
        String title = success ? "로그인 완료!" : "로그인 실패";
        String html = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\">" +
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
            "<title>wiedu 로그인</title>" +
            "<style>body{font-family:-apple-system,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#18181B;color:#fff;text-align:center;}" +
            ".container{padding:20px;}.icon{color:" + iconColor + ";font-size:48px;margin-bottom:16px;}" +
            ".info{color:#9CA3AF;font-size:14px;margin-top:16px;}</style>" +
            "</head><body><div class=\"container\">" +
            "<div class=\"icon\">" + icon + "</div>" +
            "<h2>" + title + "</h2>" +
            "<p>" + HtmlUtils.htmlEscape(message) + "</p>" +
            "<p class=\"info\">앱으로 돌아가 다시 시도해주세요.</p>" +
            "</div></body></html>";
        response.getWriter().write(html);
    }
}
