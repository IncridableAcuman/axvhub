package uz.axm.nexus.audit.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uz.axm.nexus.users.domain.User;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserSummaryDto {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private String primaryRole;
    private List<String> roles;
    private boolean enabled;
    private boolean emailVerified;
    private LocalDateTime createdAt;

    public static AdminUserSummaryDto fromEntity(User user) {
        return AdminUserSummaryDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .primaryRole(user.getRole())
                .roles(user.getRoles().stream().map(r -> r.getName()).toList())
                .enabled(user.isEnabled())
                .emailVerified(user.isEmailVerified())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
