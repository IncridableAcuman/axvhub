package uz.axm.nexus.scheduling.application;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CancelLessonRequest {
    @NotBlank(message = "Darsni bekor qilish sababi ko'rsatilishi shart")
    private String reason;
}
