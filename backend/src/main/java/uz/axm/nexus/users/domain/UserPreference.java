package uz.axm.nexus.users.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import uz.axm.nexus.shared.domain.BaseEntity;

@Entity
@Table(name = "user_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreference extends BaseEntity {

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Builder.Default
    @Column(nullable = false, length = 10)
    private String locale = "uz"; // uz, ru, en

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String theme = "system"; // light, dark, system

    @Builder.Default
    @Column(name = "reduced_motion", nullable = false)
    private boolean reducedMotion = false;

    @Builder.Default
    @Column(name = "date_format", nullable = false, length = 20)
    private String dateFormat = "YYYY-MM-DD";
}
