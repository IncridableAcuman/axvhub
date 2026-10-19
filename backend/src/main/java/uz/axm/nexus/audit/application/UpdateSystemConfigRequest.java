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
public class UpdateSystemConfigRequest {
    @NotBlank(message = "Konfiguratsiya kaliti bo'sh bo'lishi mumkin emas")
    private String key;

    @NotBlank(message = "Konfiguratsiya qiymati bo'sh bo'lishi mumkin emas")
    private String value;

    private String description;
}
