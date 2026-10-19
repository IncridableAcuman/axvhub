package uz.axm.nexus.mentors.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import uz.axm.nexus.shared.domain.BaseEntity;

@Entity
@Table(name = "mentors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mentor extends BaseEntity {

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String role; // "IT mentor", "Ingliz tili mentor"

    private String phone;

    private String email;

    private String branchLocation; // e.g. "IT Park Yangiariq"

    @Column(columnDefinition = "TEXT")
    private String bio;
}
