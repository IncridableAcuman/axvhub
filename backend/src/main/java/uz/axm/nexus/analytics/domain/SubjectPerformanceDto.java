package uz.axm.nexus.analytics.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectPerformanceDto {
    private String subject;
    private List<String> gradeLevels;
    private Integer totalGroups;
    private Integer totalStudents;
    private Double averageAssessmentScore;
    private Double averageAttendanceRate;
    private Double passRatePercentage;
    private Integer totalAssessments;
    private Integer totalLessonsCompleted;
}
