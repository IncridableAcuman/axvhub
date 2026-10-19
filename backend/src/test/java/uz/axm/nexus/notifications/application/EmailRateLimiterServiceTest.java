package uz.axm.nexus.notifications.application;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import uz.axm.nexus.shared.application.RateLimitException;

import static org.junit.jupiter.api.Assertions.*;

class EmailRateLimiterServiceTest {

    private EmailRateLimiterService rateLimiterService;

    @BeforeEach
    void setUp() {
        rateLimiterService = new EmailRateLimiterService();
        ReflectionTestUtils.setField(rateLimiterService, "cooldownSeconds", 60L);
        ReflectionTestUtils.setField(rateLimiterService, "maxPerHour", 3);
        rateLimiterService.resetAll();
    }

    @Test
    @DisplayName("Birinchi marta xat so'rash muvaffaqiyatli o'tishi kerak")
    void shouldAllowFirstRequest() {
        assertDoesNotThrow(() -> rateLimiterService.checkAndRecord("user@example.com"));
    }

    @Test
    @DisplayName("60 soniya ichida qayta xat so'ralsa RateLimitException otilishi kerak")
    void shouldBlockConsecutiveRequestWithinCooldown() {
        rateLimiterService.checkAndRecord("user@example.com");

        RateLimitException ex = assertThrows(RateLimitException.class, () ->
                rateLimiterService.checkAndRecord("user@example.com")
        );

        assertTrue(ex.getRetryAfterSeconds() > 0 && ex.getRetryAfterSeconds() <= 60);
        assertTrue(ex.getMessage().contains("Juda ko'p so'rov yuborildi"));
    }

    @Test
    @DisplayName("Boshqa email uchun cooldown ta'sir qilmasligi kerak")
    void shouldAllowDifferentEmailWithinCooldown() {
        rateLimiterService.checkAndRecord("user1@example.com");
        assertDoesNotThrow(() -> rateLimiterService.checkAndRecord("user2@example.com"));
    }

    @Test
    @DisplayName("Reset chaqirilgandan so'ng yana darhol xat so'rashga ruxsat berilishi kerak")
    void shouldAllowRequestAfterReset() {
        rateLimiterService.checkAndRecord("user@example.com");
        rateLimiterService.reset("user@example.com");

        assertDoesNotThrow(() -> rateLimiterService.checkAndRecord("user@example.com"));
    }

    @Test
    @DisplayName("Email katta-kichik harflarga sezgir bo'lmasligi kerak (case-insensitive)")
    void shouldNormalizeEmailCase() {
        rateLimiterService.checkAndRecord("User@Example.COM");

        assertThrows(RateLimitException.class, () ->
                rateLimiterService.checkAndRecord("user@example.com")
        );
    }
}
