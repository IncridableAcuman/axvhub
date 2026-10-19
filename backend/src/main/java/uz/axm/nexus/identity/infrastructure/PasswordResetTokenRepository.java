package uz.axm.nexus.identity.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.axm.nexus.identity.domain.PasswordResetToken;
import uz.axm.nexus.users.domain.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    Optional<PasswordResetToken> findByTokenAndUsedFalse(String token);

    List<PasswordResetToken> findByUserAndUsedFalse(User user);
}
