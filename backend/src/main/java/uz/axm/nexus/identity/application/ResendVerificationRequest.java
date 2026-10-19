package uz.axm.nexus.identity.application;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResendVerificationRequest {

    @NotBlank(message = "Email manzili kiritilishi shart")
    @Email(message = "Email formati noto'g'ri")
    private String email;
}
