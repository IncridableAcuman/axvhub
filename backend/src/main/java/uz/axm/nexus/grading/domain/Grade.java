package uz.axm.nexus.grading.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Grade {
    private Long id;
    private Long submissionId;
    private Long studentId;
    private int score; // 0..100
    private String feedback;
    private Long gradedByMentorId;
    private LocalDateTime gradedAt;
}
