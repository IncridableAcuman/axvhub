package uz.axm.nexus.analytics.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AcademicPeriodSummaryDto {
    private Long periodId;
    private String periodName;
    private String periodCode;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isActive;
    private Integer totalGroups;
    private Integer totalStudents;
    private Integer totalMentors;
    private Integer totalSessionsConducted;
    private Double overallAttendanceRate;
    private Double overallAssessmentAverage;
    private Double overallAssignmentCompletionRate;
    private Integer totalAssessmentsAdministered;
    private List<GroupComparisonDto> groupSummaries;
    private MetricRuleDocumentationDto ruleDocumentation;
}
