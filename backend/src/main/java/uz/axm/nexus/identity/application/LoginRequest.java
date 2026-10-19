package uz.axm.nexus.identity.application;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    @NotBlank(message = "Foydalanuvchi nomi bo'sh bo'lishi mumkin emas")
    private String username;

    @NotBlank(message = "Parol bo'sh bo'lishi mumkin emas")
    private String password;
}
