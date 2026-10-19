package uz.axm.nexus.mentors.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorProvisionDto {
    private Long id;
    private String fullName;
    private String role;
    private String phone;
    private String email;
    private String branchLocation;
    private String bio;
    private String hemisId; // 8-digit numeric ID (e.g. "32600001")
    private String temporaryPassword; // Random generated password (shown once upon creation)
    private boolean accountCreated;
    private LocalDateTime createdAt;
}
