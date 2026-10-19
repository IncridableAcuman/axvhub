package uz.axm.nexus.notifications.infrastructure;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import uz.axm.nexus.notifications.domain.Notification;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByRecipientUserId(Long recipientUserId, Pageable pageable);

    Page<Notification> findByRecipientUserIdAndRead(Long recipientUserId, boolean read, Pageable pageable);

    Page<Notification> findByRecipientUserIdAndType(Long recipientUserId, String type, Pageable pageable);

    Page<Notification> findByRecipientUserIdAndTypeAndRead(Long recipientUserId, String type, boolean read, Pageable pageable);

    long countByRecipientUserIdAndReadFalse(Long recipientUserId);

    boolean existsByRecipientUserIdAndDeduplicationKeyAndCreatedAtAfter(
            Long recipientUserId,
            String deduplicationKey,
            LocalDateTime after
    );

    Optional<Notification> findByIdAndRecipientUserId(Long id, Long recipientUserId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true, n.readAt = :now WHERE n.recipientUserId = :userId AND n.read = false")
    int markAllAsReadForUser(@Param("userId") Long userId, @Param("now") LocalDateTime now);
}
