package uz.axm.nexus.assignments.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Submission {
    private Long id;
    private Long assignmentId;
    private Long studentId;
    private String submissionUrl;
    private LocalDateTime submittedAt;
    private String status; // SUBMITTED, GRADED
}
