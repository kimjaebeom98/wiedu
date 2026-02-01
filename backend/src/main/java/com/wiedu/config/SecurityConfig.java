package com.wiedu.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())  // 개발 환경용
            .headers(headers -> headers.frameOptions(frame -> frame.disable()))  // H2 콘솔용
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/h2-console/**").permitAll()  // H2 콘솔 허용
                .requestMatchers("/api/**").permitAll()  // API 임시 허용 (개발중)
                .anyRequest().permitAll()  // 개발 환경: 모든 요청 허용
            );

        return http.build();
    }
}
