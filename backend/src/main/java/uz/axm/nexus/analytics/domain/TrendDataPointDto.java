package uz.axm.nexus.analytics.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrendDataPointDto {
    private String periodLabel; // e.g. "Hafta 1 (01-07 Okt)", "2026-W41"
    private Double attendanceRate; // 0.0 - 100.0%
    private Double averageScore; // 0.0 - 100.0%
    private Integer lessonsCompleted;
    private Integer assessmentsTaken;
}
