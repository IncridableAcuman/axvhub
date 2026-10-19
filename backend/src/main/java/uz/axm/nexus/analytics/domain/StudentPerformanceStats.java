package uz.axm.nexus.analytics.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentPerformanceStats {
    private Long studentId;
    private String studentName;
    private double averageScore;
    private int completedAssignmentsCount;
    private double attendanceRate; // foizda (masalan, 95.5%)
    private String masteryLevel; // "A'lo", "Yaxshi", "Qoniqarli"
}
