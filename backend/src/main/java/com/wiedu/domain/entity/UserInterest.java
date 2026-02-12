package com.wiedu.domain.entity;

import com.wiedu.domain.enums.InterestType;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

import java.time.LocalDateTime;

@Entity
@Table(name = "USER_INTERESTS", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "interest_type"})
})
@Comment("사용자 관심분야")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserInterest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @Comment("사용자 ID")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "interest_type", nullable = false, length = 20)
    @Comment("관심분야 유형")
    private InterestType interestType;

    @Column(nullable = false, updatable = false)
    @Comment("생성일시")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Builder
    public UserInterest(User user, InterestType interestType) {
        this.user = user;
        this.interestType = interestType;
    }

    public static UserInterest create(User user, InterestType interestType) {
        return UserInterest.builder()
                .user(user)
                .interestType(interestType)
                .build();
    }
}
