package uz.axm.nexus.notifications.infrastructure;

import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;
import uz.axm.nexus.notifications.domain.NotificationOutbox;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationDeliveryAdapter {

    private final JavaMailSender mailSender;
    private final NotificationOutboxRepository outboxRepository;

    @Value("${app.mail.enabled:true}")
    private boolean mailEnabled;

    @Value("${app.mail.from:noreply@axm-nexus.uz}")
    private String fromEmail;

    @Value("${app.mail.sender-name:AXM Nexus Ta'lim Tizimi}")
    private String senderName;

    private static final Set<String> UNROUTABLE_DOMAINS = Set.of(
            "axm-nexus.uz",
            "example.com",
            "example.org",
            "example.net",
            "test.com",
            "mock.com",
            "localhost",
            "invalid"
    );

    @Scheduled(fixedDelay = 15000, initialDelay = 5000)
    @Transactional
    public void processOutbox() {
        List<NotificationOutbox> pending = outboxRepository.findByStatusOrderByCreatedAtAsc(
                "PENDING", PageRequest.of(0, 20)
        );

        if (pending.isEmpty()) {
            return;
        }

        log.debug("Outbox navbatida {} ta bildirishnoma qayta ishlanmoqda", pending.size());
        for (NotificationOutbox outbox : pending) {
            deliverOutboxItem(outbox);
        }
    }

    public void deliverOutboxItem(NotificationOutbox outbox) {
        outbox.setAttempts(outbox.getAttempts() + 1);
        outbox.setLastAttemptAt(LocalDateTime.now());

        try {
            if (!mailEnabled) {
                log.info("[OUTBOX_SIMULATED] Email tizimi o'chirilgan, simulyatsiya qilindi: to={}, subject={}",
                        outbox.getRecipient(), sanitizeSubject(outbox.getSubject()));
                outbox.setStatus("SENT");
                outboxRepository.save(outbox);
                return;
            }

            if (isUnroutable(outbox.getRecipient())) {
                log.info("[OUTBOX_TEST_DOMAIN] Test domen uchun simulyatsiya qilindi: to={}", outbox.getRecipient());
                outbox.setStatus("SENT");
                outboxRepository.save(outbox);
                return;
            }

            // Real SMTP dispatch
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, StandardCharsets.UTF_8.name());
            helper.setFrom(new InternetAddress(fromEmail, senderName));
            helper.setTo(outbox.getRecipient());
            helper.setSubject(sanitizeSubject(outbox.getSubject()));

            // Safe sanitized body
            String sanitizedBody = sanitizeBody(outbox.getPayload());
            helper.setText(sanitizedBody, true);

            mailSender.send(message);
            outbox.setStatus("SENT");
            log.info("Outbox email muvaffaqiyatli jo'natildi: to={}", outbox.getRecipient());
        } catch (Exception e) {
            log.warn("Outbox email yetkazishda xatolik [to={}, attempt={}]: {}",
                    outbox.getRecipient(), outbox.getAttempts(), e.getMessage());
            outbox.setErrorMessage(e.getMessage());
            if (outbox.getAttempts() >= 3) {
                outbox.setStatus("FAILED");
            }
        }
        outboxRepository.save(outbox);
    }

    @Async
    public void enqueueAndDeliverDirectly(Long notificationId, String recipientEmail, String subject, String messageText) {
        if (recipientEmail == null || recipientEmail.isBlank()) {
            return;
        }
        NotificationOutbox outbox = NotificationOutbox.builder()
                .notificationId(notificationId)
                .channel("EMAIL")
                .recipient(recipientEmail)
                .subject(sanitizeSubject(subject))
                .payload(buildHtmlNotificationBody(subject, sanitizeBody(messageText)))
                .status("PENDING")
                .attempts(0)
                .build();
        outbox = outboxRepository.save(outbox);
        deliverOutboxItem(outbox);
    }

    public String sanitizeSubject(String rawSubject) {
        if (rawSubject == null) return "AXM Nexus Bildirishnoma";
        // Ensure no passwords, tokens, or confidential content in subject line
        return rawSubject.replaceAll("(?i)(password|token|parol|secret|pin)\\s*[:=]\\s*\\S+", "[XAVFSIZLIK_FILTERI]")
                .trim();
    }

    public String sanitizeBody(String rawBody) {
        if (rawBody == null) return "";
        // Redact any exposed credentials or sensitive assessment tokens
        return rawBody.replaceAll("(?i)(password|token|api[_-]?key|secret)\\s*[:=]\\s*\\S+", "[MAXFIY]")
                .trim();
    }

    private boolean isUnroutable(String email) {
        if (email == null || !email.contains("@")) return true;
        String domain = email.trim().toLowerCase().substring(email.indexOf('@') + 1);
        return UNROUTABLE_DOMAINS.contains(domain)
                || domain.endsWith(".test")
                || domain.endsWith(".example")
                || domain.endsWith(".localhost")
                || domain.endsWith(".invalid");
    }

    private String buildHtmlNotificationBody(String title, String message) {
        return "<div style=\"font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;\">"
                + "<h2 style=\"color: #2563eb; margin-top: 0;\">" + title + "</h2>"
                + "<p style=\"color: #334155; font-size: 15px; line-height: 1.5;\">" + message + "</p>"
                + "<hr style=\"border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;\" />"
                + "<p style=\"color: #94a3b8; font-size: 12px;\">AXM Nexus Ta'lim Ekotizimi &mdash; Muhammad Al-Xorazmiy Vorislari</p>"
                + "</div>";
    }
}
