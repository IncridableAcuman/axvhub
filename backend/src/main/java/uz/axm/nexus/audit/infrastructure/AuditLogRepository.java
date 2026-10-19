package uz.axm.nexus.audit.infrastructure;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import uz.axm.nexus.audit.domain.AuditLog;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long>, JpaSpecificationExecutor<AuditLog> {

    @Query("SELECT a FROM AuditLog a WHERE " +
            "(:action IS NULL OR a.action = :action) AND " +
            "(:entityName IS NULL OR a.entityName = :entityName) AND " +
            "(:performedBy IS NULL OR LOWER(a.performedBy) LIKE LOWER(CONCAT('%', :performedBy, '%'))) AND " +
            "(:query IS NULL OR LOWER(a.details) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(a.entityId) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
            "(:from IS NULL OR a.createdAt >= :from) AND " +
            "(:to IS NULL OR a.createdAt <= :to)")
    Page<AuditLog> searchAuditLogs(
            @Param("query") String query,
            @Param("action") String action,
            @Param("entityName") String entityName,
            @Param("performedBy") String performedBy,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            Pageable pageable
    );

    List<AuditLog> findTop50ByOrderByCreatedAtDesc();
}
