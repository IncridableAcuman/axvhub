package uz.axm.nexus.identity.infrastructure;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.axm.nexus.users.domain.User;
import uz.axm.nexus.users.infrastructure.UserRepository;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(usernameOrEmail, usernameOrEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Foydalanuvchi topilmadi: " + usernameOrEmail));

        Set<GrantedAuthority> authorities = new HashSet<>();
        if (user.getRole() != null && !user.getRole().isBlank()) {
            String primary = user.getRole().trim();
            String withPrefix = primary.startsWith("ROLE_") ? primary : "ROLE_" + primary;
            String withoutPrefix = primary.startsWith("ROLE_") ? primary.substring(5) : primary;
            authorities.add(new SimpleGrantedAuthority(withPrefix));
            authorities.add(new SimpleGrantedAuthority(withoutPrefix));
        }
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            user.getRoles().forEach(r -> {
                String rName = r.getName().trim();
                String withPrefix = rName.startsWith("ROLE_") ? rName : "ROLE_" + rName;
                String withoutPrefix = rName.startsWith("ROLE_") ? rName.substring(5) : rName;
                authorities.add(new SimpleGrantedAuthority(withPrefix));
                authorities.add(new SimpleGrantedAuthority(withoutPrefix));
                if (r.getPermissions() != null) {
                    r.getPermissions().forEach(p -> authorities.add(new SimpleGrantedAuthority(p.getName())));
                }
            });
        }

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                user.isEnabled(),
                true,
                true,
                true,
                authorities
        );
    }
}
