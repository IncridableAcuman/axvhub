package uz.axm.nexus.audit.application;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRolesRequest {
    @NotEmpty(message = "Kamida bitta rol tanlanishi shart")
    private Set<String> roles;

    private String reason;
}
