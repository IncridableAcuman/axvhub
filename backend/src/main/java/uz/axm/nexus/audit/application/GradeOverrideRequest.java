package uz.axm.nexus.audit.application;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GradeOverrideRequest {
    @NotNull(message = "Baho yozuvi ID ko'rsatilishi shart")
    private Long gradeRecordId;

    @NotNull(message = "Yangi ball ko'rsatilishi shart")
    private Integer newScore;

    @NotBlank(message = "Ballni o'zgartirish asosi / sababi ko'rsatilishi shart")
    private String reason;
}
