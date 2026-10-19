package uz.axm.nexus.identity.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private List<String> roles;
    private List<String> permissions;
    private boolean emailVerified;
}
