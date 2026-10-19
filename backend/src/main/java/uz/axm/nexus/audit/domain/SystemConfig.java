package uz.axm.nexus.audit.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import uz.axm.nexus.shared.domain.BaseEntity;

@Entity
@Table(name = "system_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemConfig extends BaseEntity {

    @Column(name = "config_key", nullable = false, unique = true, length = 100)
    private String configKey;

    @Column(name = "config_value", nullable = false, columnDefinition = "TEXT")
    private String configValue;

    @Builder.Default
    @Column(nullable = false, length = 50)
    private String category = "GENERAL"; // GENERAL, FEATURES, SECURITY, NOTIFICATIONS

    @Builder.Default
    @Column(name = "is_secret", nullable = false)
    private boolean secret = false;

    @Column(length = 255)
    private String description;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;
}
