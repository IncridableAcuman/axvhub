package uz.axm.nexus.ai.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiParsedResultDto {
    private boolean success;
    private String message;
    private String provider; // "groq", "gemini", "smart_local"
    private String targetMentor;
    private String branchLocation;
    @Builder.Default
    private List<ParsedScheduleDto> schedules = new ArrayList<>();
    @Builder.Default
    private List<ParsedStudentDto> students = new ArrayList<>();
    private String rawSummary;
}
