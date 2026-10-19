package uz.axm.nexus.identity.application;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Email manzili kiritilishi shart")
    @Email(message = "Email manzili to'g'ri formatda bo'lishi kerak")
    private String email;

    @NotBlank(message = "Parol kiritilishi shart")
    @Size(min = 6, max = 100, message = "Parol kamida 6 ta belgidan iborat bo'lishi kerak")
    private String password;

    private String fullName;

    private String role; // "ROLE_STUDENT", "ROLE_MENTOR", "ROLE_ENGLISH_MENTOR"

    private String phone;
}
