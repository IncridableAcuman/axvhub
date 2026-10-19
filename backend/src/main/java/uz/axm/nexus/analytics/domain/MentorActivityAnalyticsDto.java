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
public class MentorActivityAnalyticsDto {
    private Long mentorId;
    private String mentorName;
    private String role;
    private String branchLocation;
    private Integer activeGroupsCount;
    private Integer totalAssignedStudents;
    private Integer conductedSessionsCount;
    private Integer scheduledSessionsCount;
    private Integer createdLessonsCount;
    private Integer createdAssessmentsCount;
    private Integer gradedAttemptsCount;
    private Integer gradedAssignmentsCount;
    private Integer attendanceRecordsCount;
    private Double averageStudentAttendanceInMentorGroups;
    private Double averageStudentScoreInMentorGroups;
    private List<String> activeGroupCodes;
}
