package uz.axm.nexus.access.application;

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
public class AssignRolesRequest {
    @NotEmpty(message = "Kamida bitta rol tanlanishi kerak")
    private Set<String> roles;
}
