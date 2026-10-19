package uz.axm.nexus.ai.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfirmImportRequest {
    private String mentorName;
    private String mentorRole;
    private String branchLocation;
    private List<ParsedScheduleDto> schedules;
    private List<ParsedStudentDto> students;
}
