package uz.axm.nexus.notifications.application;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import uz.axm.nexus.shared.application.RateLimitException;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class EmailRateLimiterService {

    @Value("${app.mail.rate-limit.cooldown-seconds:60}")
    private long cooldownSeconds;

    @Value("${app.mail.rate-limit.max-per-hour:5}")
    private int maxPerHour;

    private final Map<String, Deque<Instant>> emailTimestamps = new ConcurrentHashMap<>();

    public synchronized void checkAndRecord(String rawEmail) {
        if (rawEmail == null || rawEmail.trim().isEmpty()) {
            return;
        }

        String email = rawEmail.trim().toLowerCase();
        Instant now = Instant.now();
        Deque<Instant> timestamps = emailTimestamps.computeIfAbsent(email, k -> new ArrayDeque<>());

        // Clean up timestamps older than 1 hour
        Instant oneHourAgo = now.minus(Duration.ofHours(1));
        while (!timestamps.isEmpty() && timestamps.peekFirst().isBefore(oneHourAgo)) {
            timestamps.pollFirst();
        }

        // 1. Check minimum cooldown between consecutive requests
        if (!timestamps.isEmpty()) {
            Instant lastRequest = timestamps.peekLast();
            Duration elapsed = Duration.between(lastRequest, now);
            if (elapsed.getSeconds() < cooldownSeconds) {
                long remainingSeconds = cooldownSeconds - elapsed.getSeconds();
                log.warn("[EMAIL_RATE_LIMIT] Qayta xat yuborish tezligi cheklandi: email={}, qolgan vaqt={} soniya",
                        email, remainingSeconds);
                throw new RateLimitException(
                        "Juda ko'p so'rov yuborildi. Iltimos, yangi tasdiqlash xatini so'rashdan oldin "
                                + remainingSeconds + " soniya kuting.",
                        remainingSeconds
                );
            }
        }

        // 2. Check maximum allowed requests per hour
        if (timestamps.size() >= maxPerHour) {
            log.warn("[EMAIL_RATE_LIMIT] 1 soatlik yuborish limiti oshib ketdi: email={}, limit={}", email, maxPerHour);
            throw new RateLimitException(
                    "Ushbu email manziliga 1 soat ichida xat yuborish limiti (" + maxPerHour
                            + " ta) tugadi. Iltimos, keyinroq urinib ko'ring.",
                    3600
            );
        }

        // Record successful dispatch attempt
        timestamps.addLast(now);
    }

    public synchronized long getRemainingCooldownSeconds(String rawEmail) {
        if (rawEmail == null || rawEmail.trim().isEmpty()) {
            return 0;
        }
        String email = rawEmail.trim().toLowerCase();
        Deque<Instant> timestamps = emailTimestamps.get(email);
        if (timestamps == null || timestamps.isEmpty()) {
            return 0;
        }
        Instant lastRequest = timestamps.peekLast();
        Duration elapsed = Duration.between(lastRequest, Instant.now());
        long remaining = cooldownSeconds - elapsed.getSeconds();
        return Math.max(0, remaining);
    }

    public synchronized void reset(String rawEmail) {
        if (rawEmail != null) {
            emailTimestamps.remove(rawEmail.trim().toLowerCase());
        }
    }

    public synchronized void resetAll() {
        emailTimestamps.clear();
    }
}
