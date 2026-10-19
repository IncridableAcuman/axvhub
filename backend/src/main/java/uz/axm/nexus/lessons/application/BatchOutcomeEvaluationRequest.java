package uz.axm.nexus.lessons.application;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchOutcomeEvaluationRequest {

    @NotNull(message = "Dars IDsi majburiy")
    private Long lessonId;

    @Valid
    @NotNull(message = "Baholashlar ro'yxati majburiy")
    private List<OutcomeEvaluationDto> evaluations;
}
