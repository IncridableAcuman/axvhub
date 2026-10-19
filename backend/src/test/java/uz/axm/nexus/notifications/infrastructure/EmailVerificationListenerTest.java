package uz.axm.nexus.notifications.infrastructure;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;
import org.thymeleaf.spring6.SpringTemplateEngine;
import uz.axm.nexus.notifications.application.EmailVerificationEvent;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailVerificationListenerTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private SpringTemplateEngine templateEngine;

    private EmailVerificationListener listener;

    @BeforeEach
    void setUp() {
        listener = new EmailVerificationListener(mailSender, templateEngine);
        ReflectionTestUtils.setField(listener, "mailEnabled", true);
        ReflectionTestUtils.setField(listener, "fromEmail", "noreply@axm-nexus.uz");
        ReflectionTestUtils.setField(listener, "senderName", "AXM Nexus");
    }

    @Test
    @DisplayName("axm-nexus.uz yoki test.com kabi soxta domenlar uchun SMTP ga so'rov yuborilmasligi kerak")
    void shouldSkipSendingToUnroutableDomains() {
        EmailVerificationEvent event = EmailVerificationEvent.builder()
                .recipientEmail("verify.me@axm-nexus.uz")
                .recipientName("Verify User")
                .verificationCode("123456")
                .confirmationUrl("http://localhost:5173/auth/verify-email?token=xyz")
                .build();

        listener.handleEmailVerificationEvent(event);

        verifyNoInteractions(mailSender);
    }

    @Test
    @DisplayName("mailEnabled=false bo'lganda email yuborish simulyatsiya qilinishi va SMTP chaqirilmasligi kerak")
    void shouldSkipSendingWhenMailDisabled() {
        ReflectionTestUtils.setField(listener, "mailEnabled", false);

        EmailVerificationEvent event = EmailVerificationEvent.builder()
                .recipientEmail("realuser@gmail.com")
                .recipientName("Real User")
                .verificationCode("654321")
                .confirmationUrl("http://localhost:5173/auth/verify-email?token=abc")
                .build();

        listener.handleEmailVerificationEvent(event);

        verifyNoInteractions(mailSender);
    }

    @Test
    @DisplayName("isUnroutableDomain testi soxta va haqiqiy domenlarni to'g'ri ajrata olishi kerak")
    void shouldCorrectlyDetectUnroutableDomains() {
        assertTrue(listener.isUnroutableDomain("verify.me@axm-nexus.uz"));
        assertTrue(listener.isUnroutableDomain("test@example.com"));
        assertTrue(listener.isUnroutableDomain("student@test.com"));
        assertTrue(listener.isUnroutableDomain("user@localhost"));
        assertTrue(listener.isUnroutableDomain("user@myapp.invalid"));

        assertFalse(listener.isUnroutableDomain("real.user@gmail.com"));
        assertFalse(listener.isUnroutableDomain("student@mail.ru"));
        assertFalse(listener.isUnroutableDomain("mentor@yahoo.com"));
    }
}
