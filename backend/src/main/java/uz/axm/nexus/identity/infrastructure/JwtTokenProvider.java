package uz.axm.nexus.identity.infrastructure;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import uz.axm.nexus.users.domain.User;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@Slf4j
public class JwtTokenProvider {

    private final SecretKey key;
    private final long expirationMs;
    private final long refreshExpirationMs;

    public JwtTokenProvider(
            @Value("${app.jwt.secret:axm_nexus_super_secret_jwt_key_that_is_at_least_256_bits_long_for_security_reasons_12345}") String secret,
            @Value("${app.jwt.expiration-ms:86400000}") long expirationMs,
            @Value("${app.jwt.refresh-expiration-ms:604800000}") long refreshExpirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    public String generateAccessToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", user.getId());
        claims.put("email", user.getEmail());
        claims.put("fullName", user.getFullName());
        claims.put("role", user.getRole());
        claims.put("emailVerified", user.isEmailVerified());

        List<String> roles = new ArrayList<>();
        if (user.getRole() != null && !user.getRole().isBlank()) {
            String primary = user.getRole().startsWith("ROLE_") ? user.getRole() : "ROLE_" + user.getRole();
            roles.add(primary);
        }
        Set<String> permissions = new HashSet<>();
        if (user.getRoles() != null) {
            user.getRoles().forEach(r -> {
                String rName = r.getName().startsWith("ROLE_") ? r.getName() : "ROLE_" + r.getName();
                if (!roles.contains(rName)) {
                    roles.add(rName);
                }
                if (r.getPermissions() != null) {
                    r.getPermissions().forEach(p -> permissions.add(p.getName()));
                }
            });
        }
        if (roles.isEmpty()) {
            roles.add("ROLE_STUDENT");
        }
        claims.put("roles", roles);
        claims.put("permissions", new ArrayList<>(permissions));

        return createToken(claims, user.getUsername(), expirationMs);
    }

    public String generateAccessToken(UserDetails userDetails, Long userId, String email, String fullName, boolean emailVerified) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", userId);
        claims.put("email", email);
        claims.put("fullName", fullName);
        claims.put("emailVerified", emailVerified);
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
        claims.put("roles", roles);

        return createToken(claims, userDetails.getUsername(), expirationMs);
    }

    public String generateRefreshToken(String username) {
        return createToken(new HashMap<>(), username, refreshExpirationMs);
    }

    private String createToken(Map<String, Object> claims, String subject, long validityMs) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + validityMs);

        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(now)
                .expiration(validity)
                .signWith(key)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Yaroqsiz JWT token: {}", e.getMessage());
            return false;
        }
    }

    public String getUsernameFromToken(String token) {
        return getClaims(token).getSubject();
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = getClaims(token);
        Object idObj = claims.get("id");
        if (idObj instanceof Number number) {
            return number.longValue();
        }
        return null;
    }

    public Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
