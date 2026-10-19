package uz.axm.nexus.notifications.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailProducerService {

    private final RabbitTemplate rabbitTemplate;

    @Value("${app.mail.enabled:true}")
    private boolean mailEnabled;

    @Value("${app.rabbitmq.email-exchange:axm.nexus.email.exchange}")
    private String emailExchange;

    @Value("${app.rabbitmq.email-verification-routing-key:axm.nexus.email.verification.key}")
    private String emailVerificationRoutingKey;

    public void sendVerificationEmail(EmailVerificationEvent event) {
        if (!mailEnabled) {
            log.info("[EMAIL_DISABLED] Email jo'natish o'chirilgan (app.mail.enabled=false). RabbitMQ ga xabar yuborilmadi: {}",
                    event.getRecipientEmail());
            return;
        }

        try {
            log.info("Email tasdiqlash xabari RabbitMQ navbatiga yuborilmoqda: email={}, exchange={}, routingKey={}",
                    event.getRecipientEmail(), emailExchange, emailVerificationRoutingKey);
            rabbitTemplate.convertAndSend(emailExchange, emailVerificationRoutingKey, event);
            log.info("Email tasdiqlash xabari RabbitMQ navbatiga muvaffaqiyatli jo'natildi: {}", event.getRecipientEmail());
        } catch (Exception e) {
            log.error("RabbitMQ orqali email xabarini yuborishda xatolik yuz berdi [email={}]: {}",
                    event.getRecipientEmail(), e.getMessage());
        }
    }
}
