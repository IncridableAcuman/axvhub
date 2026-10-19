package uz.axm.nexus.identity.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.axm.nexus.identity.domain.EmailVerificationToken;
import uz.axm.nexus.users.domain.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {

    Optional<EmailVerificationToken> findByToken(String token);

    Optional<EmailVerificationToken> findByTokenAndUsedFalse(String token);

    Optional<EmailVerificationToken> findByUserAndCodeAndUsedFalse(User user, String code);

    List<EmailVerificationToken> findByUserAndUsedFalse(User user);
}
