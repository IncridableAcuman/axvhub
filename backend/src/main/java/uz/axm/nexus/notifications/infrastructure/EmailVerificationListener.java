package uz.axm.nexus.notifications.infrastructure;

import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import uz.axm.nexus.notifications.application.EmailVerificationEvent;

import java.nio.charset.StandardCharsets;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationListener {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Value("${app.mail.enabled:true}")
    private boolean mailEnabled;

    @Value("${app.mail.from:noreply@axm-nexus.uz}")
    private String fromEmail;

    @Value("${app.mail.sender-name:AXM Nexus Ta'lim Tizimi}")
    private String senderName;

    // Domains that cannot receive real public emails via SMTP (preventing DNS NXDOMAIN bounce spam)
    private static final Set<String> UNROUTABLE_TEST_DOMAINS = Set.of(
            "axm-nexus.uz",
            "example.com",
            "example.org",
            "example.net",
            "test.com",
            "mock.com",
            "localhost",
            "invalid"
    );

    @RabbitListener(queues = "${app.rabbitmq.email-verification-queue:axm.nexus.email.verification.queue}")
    public void handleEmailVerificationEvent(EmailVerificationEvent event) {
        String recipient = event.getRecipientEmail();
        log.info("RabbitMQ navbatidan email tasdiqlash xabari qabul qilindi: recipient={}", recipient);

        try {
            // 1. Check if email sending is globally enabled
            if (!mailEnabled) {
                log.info("[EMAIL_DISABLED] Email jo'natish tizimi o'chirilgan (app.mail.enabled=false). Simulyatsiya: to={}, code={}, url={}",
                        recipient, event.getVerificationCode(), event.getConfirmationUrl());
                return;
            }

            // 2. Check if the domain is a fictional / test domain (prevents Mailer-Daemon NXDOMAIN bounce errors)
            if (isUnroutableDomain(recipient)) {
                log.info("[EMAIL_SIMULATED] Test/soxta domen aniqlandi, haqiqiy SMTP orqali yuborilmadi (DNS NXDOMAIN oldi olindi): to={}, code={}, url={}",
                        recipient, event.getVerificationCode(), event.getConfirmationUrl());
                return;
            }

            // 3. Send real email via SMTP
            sendVerificationEmail(event);
            log.info("Email muvaffaqiyatli jo'natildi: {}", recipient);
        } catch (Exception e) {
            log.error("Email yuborishda xatolik yuz berdi [recipient={}]: {}", recipient, e.getMessage());
        }
    }

    public boolean isUnroutableDomain(String email) {
        if (email == null || !email.contains("@")) {
            return true;
        }
        String cleanEmail = email.trim().toLowerCase();
        String domain = cleanEmail.substring(cleanEmail.indexOf('@') + 1);

        return UNROUTABLE_TEST_DOMAINS.contains(domain)
                || domain.endsWith(".test")
                || domain.endsWith(".example")
                || domain.endsWith(".localhost")
                || domain.endsWith(".invalid")
                || cleanEmail.contains("verify.me@");
    }

    public void sendVerificationEmail(EmailVerificationEvent event) throws Exception {
        Context context = new Context();
        context.setVariable("name", event.getRecipientName() != null ? event.getRecipientName() : "Foydalanuvchi");
        context.setVariable("code", event.getVerificationCode());
        context.setVariable("confirmationUrl", event.getConfirmationUrl());
        context.setVariable("expirationHours", event.getExpirationHours() > 0 ? event.getExpirationHours() : 24);

        String htmlContent = templateEngine.process("email/verification-email", context);

        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(
                mimeMessage,
                MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                StandardCharsets.UTF_8.name()
        );

        helper.setFrom(new InternetAddress(fromEmail, senderName));
        helper.setTo(event.getRecipientEmail());
        helper.setSubject("AXM Nexus — Elektron pochta manzilingizni tasdiqlang");
        helper.setText(htmlContent, true);

        mailSender.send(mimeMessage);
    }
}
