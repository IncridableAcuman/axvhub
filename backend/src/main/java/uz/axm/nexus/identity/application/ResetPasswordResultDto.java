package uz.axm.nexus.identity.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordResultDto {
    private Long targetId;
    private String identifier; // Hemis ID or username
    private String fullName;
    private String newPassword;
}
