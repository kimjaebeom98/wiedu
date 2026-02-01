package com.wiedu.service;

import com.wiedu.domain.entity.User;
import com.wiedu.dto.request.SignUpRequest;
import com.wiedu.dto.request.UserUpdateRequest;
import com.wiedu.dto.response.UserResponse;
import com.wiedu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 사용자 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    /**
     * 회원가입
     */
    @Transactional
    public UserResponse signUp(SignUpRequest request) {
        // 이메일 중복 체크
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다: " + request.email());
        }

        // 닉네임 중복 체크
        if (userRepository.existsByNickname(request.nickname())) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다: " + request.nickname());
        }

        // TODO: 비밀번호 암호화 (BCryptPasswordEncoder 적용 예정)
        User user = User.builder()
                .email(request.email())
                .nickname(request.nickname())
                .password(request.password())  // 암호화 필요
                .profileImage(request.profileImage())
                .build();

        User savedUser = userRepository.save(user);
        return UserResponse.from(savedUser);
    }

    /**
     * 사용자 조회 (ID)
     */
    public UserResponse findById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));
        return UserResponse.from(user);
    }

    /**
     * 사용자 조회 (이메일)
     */
    public UserResponse findByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + email));
        return UserResponse.from(user);
    }

    /**
     * 사용자 정보 수정
     */
    @Transactional
    public UserResponse updateUser(Long userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));

        // 닉네임 변경 시 중복 체크
        if (request.nickname() != null && !request.nickname().equals(user.getNickname())) {
            if (userRepository.existsByNickname(request.nickname())) {
                throw new IllegalArgumentException("이미 사용 중인 닉네임입니다: " + request.nickname());
            }
        }

        user.updateProfile(
                request.nickname() != null ? request.nickname() : user.getNickname(),
                request.profileImage() != null ? request.profileImage() : user.getProfileImage()
        );

        return UserResponse.from(user);
    }

    /**
     * 이메일 중복 체크
     */
    public boolean isEmailDuplicated(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * 닉네임 중복 체크
     */
    public boolean isNicknameDuplicated(String nickname) {
        return userRepository.existsByNickname(nickname);
    }

    /**
     * 내부용: Entity 조회
     */
    public User findUserEntityById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));
    }
}
