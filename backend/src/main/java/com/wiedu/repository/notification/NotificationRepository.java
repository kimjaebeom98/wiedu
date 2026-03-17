package com.wiedu.repository.notification;

import com.wiedu.domain.entity.Notification;
import com.wiedu.domain.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * 사용자의 알림 목록 조회 (최신순)
     */
    @Query("SELECT n FROM Notification n WHERE n.recipient = :recipient ORDER BY n.createdAt DESC")
    Page<Notification> findByRecipient(@Param("recipient") User recipient, Pageable pageable);

    /**
     * 읽지 않은 알림 수 조회
     */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipient = :recipient AND n.isRead = false")
    long countUnreadByRecipient(@Param("recipient") User recipient);

    /**
     * 사용자의 모든 알림 읽음 처리
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipient = :recipient AND n.isRead = false")
    int markAllAsRead(@Param("recipient") User recipient);

    /**
     * 특정 타입의 알림 삭제 (targetId, targetType 기준)
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.recipient = :recipient AND n.type = :type AND n.targetId = :targetId AND n.targetType = :targetType")
    void deleteByRecipientAndTypeAndTarget(
            @Param("recipient") User recipient,
            @Param("type") com.wiedu.domain.enums.NotificationType type,
            @Param("targetId") Long targetId,
            @Param("targetType") String targetType
    );

    /**
     * 사용자 삭제 시 해당 사용자의 모든 알림 삭제
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.recipient.id = :recipientId")
    void deleteByRecipientId(@Param("recipientId") Long recipientId);
}
