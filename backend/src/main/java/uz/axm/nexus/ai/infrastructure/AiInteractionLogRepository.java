package uz.axm.nexus.ai.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.axm.nexus.ai.domain.assistant.AiInteractionLog;

import java.util.List;

@Repository
public interface AiInteractionLogRepository extends JpaRepository<AiInteractionLog, Long> {
    List<AiInteractionLog> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<AiInteractionLog> findByIntent(String intent);
}
