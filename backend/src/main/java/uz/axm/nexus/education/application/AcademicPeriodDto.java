package uz.axm.nexus.education.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AcademicPeriodDto {
    private Long id;
    private String name;
    private String code;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean isActive;
}
