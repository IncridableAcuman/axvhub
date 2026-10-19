package uz.axm.nexus.audit.application;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserStatusRequest {
    @Builder.Default
    private Boolean enabled = true;

    @NotBlank(message = "Holatni o'zgartirish sababi ko'rsatilishi shart")
    private String reason;

    public boolean isEnabled() {
        return Boolean.TRUE.equals(enabled);
    }
}
