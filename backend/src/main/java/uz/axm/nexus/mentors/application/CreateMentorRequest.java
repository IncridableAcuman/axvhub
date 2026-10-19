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
public class CreateMentorRequest {

    @NotBlank(message = "Mentor to'liq ismi (F.I.Sh) kiritilishi shart")
    private String fullName;

    @NotBlank(message = "Mentor lavozimi yoki yo'nalishi kiritilishi shart")
    private String role; // "IT mentor", "Ingliz tili mentor"

    private String phone;
    private String email;
    private String branchLocation;
    private String bio;
}
