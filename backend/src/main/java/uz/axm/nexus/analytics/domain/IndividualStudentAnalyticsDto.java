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
public class IndividualStudentAnalyticsDto {
    private Long studentId;
    private String studentName;
    private String studentIdNumber;
    private String gradeLevel;
    private Long groupId;
    private String groupCode;
    private String mentorName;
    private String branchLocation;

    // 1. Lessons
    private Integer completedLessonsCount;
    private Integer totalCurriculumLessons;
    private Double lessonCompletionRate; // 0 - 100%

    // 2. Attendance with strict denominator & status breakdown
    private Integer totalScheduledSessions;
    private Integer presentCount;
    private Integer lateCount;
    private Integer excusedCount;
    private Integer absentCount;
    private Double attendanceRate; // 0 - 100%

    // 3. Assessments
    private Integer totalAssessmentsAssigned;
    private Integer assessmentsAttempted;
    private Double assessmentCompletionRate; // 0 - 100%
    private Double averageAssessmentScore; // 0 - 100%
    private Double highestAssessmentScore;
    private Double lowestAssessmentScore;

    // 4. Assignments
    private Integer totalAssignmentsAssigned;
    private Integer assignmentsSubmitted;
    private Double assignmentCompletionRate; // 0 - 100%
    private Double averageAssignmentScore; // 0 - 100%

    // 5. Overall composite
    private Double overallAverageScore; // 0 - 100%
    private String masteryLevel; // "A'lo (90-100%)", "Yaxshi (80-89%)", "Qoniqarli (60-79%)", "Rivojlanish talab (<60%)"

    // 6. Trend over time
    private List<TrendDataPointDto> progressOverTime;

    // 7. Rules Transparency
    private MetricRuleDocumentationDto ruleDocumentation;
}
