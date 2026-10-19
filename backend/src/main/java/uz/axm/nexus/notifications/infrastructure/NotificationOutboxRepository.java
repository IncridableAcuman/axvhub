package uz.axm.nexus.notifications.infrastructure;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.axm.nexus.notifications.domain.NotificationOutbox;

import java.util.List;

@Repository
public interface NotificationOutboxRepository extends JpaRepository<NotificationOutbox, Long> {

    List<NotificationOutbox> findByStatusOrderByCreatedAtAsc(String status, Pageable pageable);
}
