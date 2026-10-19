package uz.axm.nexus.audit.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import uz.axm.nexus.shared.domain.BaseEntity;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog extends BaseEntity {

    @Column(nullable = false, length = 50)
    private String action; // ROLE_ASSIGN, ROLE_REVOKE, ACCOUNT_SUSPEND, ACCOUNT_REACTIVATE, etc.

    @Column(name = "entity_name", length = 100)
    private String entityName; // User, StudyGroup, Lesson, Assessment, Grade, SystemConfig, Report

    @Column(name = "entity_id", length = 100)
    private String entityId;

    @Column(name = "performed_by", nullable = false, length = 100)
    private String performedBy;

    @Builder.Default
    @Column(length = 20)
    private String outcome = "SUCCESS"; // SUCCESS, FAILURE, DENIED

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(columnDefinition = "TEXT")
    private String metadata;
}
