package uz.axm.nexus.identity.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthUser implements Serializable {
    private Long id;
    private String username;
    private String fullName;
    private List<String> roles;
}
