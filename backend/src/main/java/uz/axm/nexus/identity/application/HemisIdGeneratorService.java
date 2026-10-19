package uz.axm.nexus.identity.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import uz.axm.nexus.users.infrastructure.StudentRepository;
import uz.axm.nexus.users.infrastructure.UserRepository;

import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class HemisIdGeneratorService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final String LOWERCASE = "abcdefghjkmnpqrstuvwxyz";
    private static final String DIGITS = "23456789";
    private static final String SYMBOLS = "!@#$*";
    private static final String ALL_CHARS = UPPERCASE + LOWERCASE + DIGITS + SYMBOLS;

    /**
     * Mentorlar uchun HEMIS tartibidagi 8 xonali raqamli ID:
     * 3 (Xodim/Mentor) + 26 (2026-yil) + 00001 (tartib raqam)
     */
    public synchronized String generateMentorId() {
        int sequence = 1;
        while (sequence < 99999) {
            String candidate = String.format("326%05d", sequence);
            if (!userRepository.existsByUsernameIgnoreCase(candidate)) {
                return candidate;
            }
            sequence++;
        }
        return "326" + (10000 + RANDOM.nextInt(89999));
    }

    /**
     * O'quvchilar uchun HEMIS tartibidagi 8 xonali raqamli ID:
     * 4 (O'quvchi/Talaba) + 26 (2026-yil) + 00001 (tartib raqam)
     */
    public synchronized String generateStudentId() {
        int sequence = 1;
        while (sequence < 99999) {
            String candidate = String.format("426%05d", sequence);
            if (!userRepository.existsByUsernameIgnoreCase(candidate)
                    && studentRepository.findByStudentIdNumber(candidate).isEmpty()) {
                return candidate;
            }
            sequence++;
        }
        return "426" + (10000 + RANDOM.nextInt(89999));
    }

    /**
     * Yangi ochilgan yoki tiklangan hisoblar uchun xavfsiz va qulay tasodifiy 8 belgili parol.
     */
    public String generatePassword() {
        char[] password = new char[8];
        password[0] = UPPERCASE.charAt(RANDOM.nextInt(UPPERCASE.length()));
        password[1] = LOWERCASE.charAt(RANDOM.nextInt(LOWERCASE.length()));
        password[2] = DIGITS.charAt(RANDOM.nextInt(DIGITS.length()));
        password[3] = SYMBOLS.charAt(RANDOM.nextInt(SYMBOLS.length()));

        for (int i = 4; i < 8; i++) {
            password[i] = ALL_CHARS.charAt(RANDOM.nextInt(ALL_CHARS.length()));
        }

        // Shuffle characters
        for (int i = password.length - 1; i > 0; i--) {
            int j = RANDOM.nextInt(i + 1);
            char temp = password[i];
            password[i] = password[j];
            password[j] = temp;
        }

        return new String(password);
    }
}
