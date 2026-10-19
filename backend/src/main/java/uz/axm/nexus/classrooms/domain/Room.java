package uz.axm.nexus.classrooms.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import uz.axm.nexus.shared.domain.BaseEntity;

@Entity
@Table(name = "rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room extends BaseEntity {

    @Column(nullable = false)
    private String name; // e.g. "IT Lab 1"

    private String branchLocation; // e.g. "IT Park Yangiariq"

    private Integer capacity; // Masalan: 16 kompyuterli o'rin
}
