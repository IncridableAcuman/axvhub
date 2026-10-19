package uz.axm.nexus.mentors.application;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewProfileRequest {
    @NotBlank(message = "Ko'rib chiqish holati tanlanishi shart")
    private String status; // "APPROVED", "REJECTED", "PUBLISHED"

    private String rejectionReason;
}
