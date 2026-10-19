package uz.axm.nexus.education.domain;

import jakarta.persistence.*;
import lombok.*;
import uz.axm.nexus.shared.domain.BaseEntity;

import java.time.LocalDate;

@Entity
@Table(name = "academic_periods")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcademicPeriod extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name; // e.g. "2026-2027 O'quv yili (Kuzgi semestr)"

    @Column(nullable = false, unique = true, length = 50)
    private String code; // e.g. "AY-2026-F"

    private LocalDate startDate;

    private LocalDate endDate;

    @Builder.Default
    @Column(nullable = false)
    private boolean isActive = true;
}
