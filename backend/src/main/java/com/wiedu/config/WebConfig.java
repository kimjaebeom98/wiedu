package com.wiedu.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Spring MVC 설정
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    /**
     * 정적 리소스 핸들러 설정
     * /uploads/** 경로를 로컬 파일 시스템에 매핑
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 절대 경로로 변환
        String absolutePath = Paths.get(uploadDir).toAbsolutePath().normalize().toString();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + absolutePath + "/")
                .setCachePeriod(3600); // 1시간 캐싱
    }

    /**
     * CORS 설정
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:19006", "exp://192.168.0.0-192.168.255.255:8081")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
