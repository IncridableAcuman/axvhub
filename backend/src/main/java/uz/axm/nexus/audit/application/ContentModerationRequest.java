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
public class ContentModerationRequest {
    @NotBlank(message = "Kontent turi ko'rsatilishi shart (LESSON, RESOURCE, ASSESSMENT)")
    private String contentType;

    @NotNull(message = "Kontent ID ko'rsatilishi shart")
    private Long contentId;

    @NotBlank(message = "Yangi status ko'rsatilishi shart (APPROVED, FLAGGED, ARCHIVED)")
    private String status;

    private String moderatorNote;
}
