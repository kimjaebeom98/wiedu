package com.wiedu.domain.entity;

import com.wiedu.domain.enums.InterestType;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "USER_CATEGORY_TEMPERATURES", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "category"})
})
@Comment("사용자 분야별 전문성(카테고리 온도)")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserCategoryTemperature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("고유 ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @Comment("사용자 ID")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 20)
    @Comment("관심분야 카테고리")
    private InterestType category;

    @Column(nullable = false, precision = 4, scale = 1)
    @Comment("분야별 온도 (기본 36.5)")
    private BigDecimal temperature = BigDecimal.valueOf(36.5);

    @Column(nullable = false)
    @Comment("해당 분야 스터디 참여 수")
    private Integer studyCount = 0;

    @Comment("마지막 업데이트 일시")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Builder
    public UserCategoryTemperature(User user, InterestType category) {
        this.user = user;
        this.category = category;
        this.temperature = BigDecimal.valueOf(36.5);
        this.studyCount = 0;
    }

    public static UserCategoryTemperature create(User user, InterestType category) {
        return UserCategoryTemperature.builder()
                .user(user)
                .category(category)
                .build();
    }

    public void increaseTemperature(BigDecimal amount) {
        this.temperature = this.temperature.add(amount);
        this.studyCount = this.studyCount + 1;
    }
}
