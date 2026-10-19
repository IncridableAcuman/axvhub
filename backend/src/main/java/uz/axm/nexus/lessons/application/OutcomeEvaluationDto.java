package uz.axm.nexus.lessons.application;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uz.axm.nexus.lessons.domain.EvidenceSource;
import uz.axm.nexus.lessons.domain.OutcomeStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OutcomeEvaluationDto {
    private Long id;

    @NotNull(message = "Dars IDsi majburiy")
    private Long lessonId;

    @NotNull(message = "O'quvchi IDsi majburiy")
    private Long studentId;

    private String studentName;

    @NotBlank(message = "Maqsad kodi majburiy")
    private String objectiveId;

    @NotBlank(message = "Maqsad nomi majburiy")
    private String objectiveTitle;

    @NotNull(message = "Status majburiy")
    private OutcomeStatus status;

    private EvidenceSource evidenceSource;
    private BigDecimal evidenceScore;
    private String mentorNotes;
    private String evaluatedBy;
    private LocalDateTime evaluatedAt;
}
