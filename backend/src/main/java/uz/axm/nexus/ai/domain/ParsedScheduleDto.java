package uz.axm.nexus.ai.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParsedScheduleDto {
    private String groupCode;
    private String gradeLevel;
    private String subject;
    private String days;
    private String startTime;
    private String endTime;
    private String room;
    private String branchLocation;
    private String mentorName;
    private String mentorRole;
}
