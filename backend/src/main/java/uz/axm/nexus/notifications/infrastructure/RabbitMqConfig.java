package uz.axm.nexus.notifications.infrastructure;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {

    @Value("${app.rabbitmq.email-exchange:axm.nexus.email.exchange}")
    private String emailExchange;

    @Value("${app.rabbitmq.email-verification-queue:axm.nexus.email.verification.queue}")
    private String emailVerificationQueue;

    @Value("${app.rabbitmq.email-verification-routing-key:axm.nexus.email.verification.key}")
    private String emailVerificationRoutingKey;

    @Bean
    public Queue emailVerificationQueue() {
        return QueueBuilder.durable(emailVerificationQueue)
                .withArgument("x-dead-letter-exchange", "")
                .build();
    }

    @Bean
    public DirectExchange emailExchange() {
        return new DirectExchange(emailExchange, true, false);
    }

    @Bean
    public Binding emailVerificationBinding(Queue emailVerificationQueue, DirectExchange emailExchange) {
        return BindingBuilder.bind(emailVerificationQueue)
                .to(emailExchange)
                .with(emailVerificationRoutingKey);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter jsonMessageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter);
        return template;
    }
}
