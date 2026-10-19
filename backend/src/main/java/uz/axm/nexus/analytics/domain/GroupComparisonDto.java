package uz.axm.nexus.analytics.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupComparisonDto {
    private Long groupId;
    private String groupCode;
    private String gradeLevel;
    private String subject;
    private String mentorName;
    private Integer studentCount;
    private Double attendanceRate;
    private Double averageAssessmentScore;
    private Double assignmentCompletionRate;
    private Integer completedLessons;
}
