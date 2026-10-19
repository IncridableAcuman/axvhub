package uz.axm.nexus.analytics.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentPerformanceSummaryDto {
    private Long studentId;
    private String studentName;
    private String studentIdNumber;
    private Double attendanceRate;
    private Double averageScore;
    private Integer completedLessons;
    private Integer submittedAssignments;
    private String masteryLevel;
}
