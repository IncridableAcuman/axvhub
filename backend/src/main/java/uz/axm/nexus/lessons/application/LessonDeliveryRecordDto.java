package uz.axm.nexus.lessons.application;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonDeliveryRecordDto {
    private Long id;

    @NotNull(message = "Dars IDsi majburiy")
    private Long lessonId;

    private Long mentorId;
    private Integer actualDurationMinutes;
    private String topicsCovered;
    private Integer practicalExercisesCompleted;
    private String commonDifficulties;
    private BigDecimal studentParticipationRate;
    private String homeworkAssigned;
    private String topicsRequiringRevision;
    private String whatWorkedWell;
    private String needsFurtherExplanation;
    private String exerciseDifficulty;
    private String changeNextTime;
    private LocalDateTime recordedAt;
}
