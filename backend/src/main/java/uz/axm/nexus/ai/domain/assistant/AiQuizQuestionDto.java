package uz.axm.nexus.ai.domain.assistant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiQuizQuestionDto {
    private String questionText;
    @Builder.Default
    private String questionType = "MULTIPLE_CHOICE"; // MULTIPLE_CHOICE, OPEN_ENDED
    private List<String> options;
    private String correctAnswer;
    private String explanation;
    @Builder.Default
    private Integer points = 10;
}
