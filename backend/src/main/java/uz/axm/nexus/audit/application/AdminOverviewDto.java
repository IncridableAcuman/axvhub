package uz.axm.nexus.audit.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminOverviewDto {
    private long totalUsers;
    private long totalStudents;
    private long totalMentors;
    private long totalStudyGroups;
    private long totalLessons;
    private long totalAssessments;
    private long totalAuditLogs;
    private String systemStatus; // HEALTHY, DEGRADED, MAINTENANCE
    private Map<String, Object> operationalMetrics;
}
