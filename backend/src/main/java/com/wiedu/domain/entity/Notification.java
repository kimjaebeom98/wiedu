package com.wiedu.domain.entity;

import com.wiedu.domain.enums.NotificationType;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

import java.time.LocalDateTime;

@Entity
@Table(name = "NOTIFICATIONS", indexes = {
    @Index(name = "idx_notification_recipient", columnList = "recipient_id"),
    @Index(name = "idx_notification_created_at", columnList = "created_at DESC")
})
@Comment("알림 정보")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("알림 고유 ID")
    private Long id;

    @Column(nullable = false, updatable = false)
    @Comment("생성 일시")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    @Comment("알림 수신자")
    private User recipient;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Comment("알림 유형")
    private NotificationType type;

    @Column(nullable = false, length = 100)
    @Comment("알림 제목")
    private String title;

    @Column(nullable = false, length = 500)
    @Comment("알림 내용")
    private String message;

    @Comment("연관 대상 ID (스터디ID, 사용자ID 등)")
    private Long targetId;

    @Column(length = 30)
    @Comment("연관 대상 유형 (STUDY, USER 등)")
    private String targetType;

    @Column(nullable = false)
    @Comment("읽음 여부")
    private boolean isRead = false;

    @Builder
    public Notification(User recipient, NotificationType type, String title, String message,
                        Long targetId, String targetType) {
        this.recipient = recipient;
        this.type = type;
        this.title = title;
        this.message = message;
        this.targetId = targetId;
        this.targetType = targetType;
    }

    public void markAsRead() {
        this.isRead = true;
    }
}
