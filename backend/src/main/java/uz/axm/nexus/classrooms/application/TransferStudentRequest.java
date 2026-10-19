package uz.axm.nexus.classrooms.application;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransferStudentRequest {
    @NotNull(message = "Ko'chirilayotgan yangi guruh tanlanishi shart")
    private Long targetGroupId;

    private String reason;
}
