package uz.axm.nexus.notifications.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.axm.nexus.ai.application.assistant.GroqProviderAdapter;
import uz.axm.nexus.ai.domain.assistant.AiCompletionResponse;
import uz.axm.nexus.ai.domain.assistant.AiIntent;
import uz.axm.nexus.ai.domain.assistant.AiPromptRequest;
import uz.axm.nexus.ai.domain.assistant.AiRole;
import uz.axm.nexus.notifications.domain.Notification;
import uz.axm.nexus.notifications.domain.NotificationType;
import uz.axm.nexus.notifications.infrastructure.NotificationRepository;
import uz.axm.nexus.users.domain.User;
import uz.axm.nexus.users.infrastructure.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiNotificationService {

    private final GroqProviderAdapter groqProviderAdapter;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.ai.groq.model:llama-3.1-8b-instant}")
    private String groqModel;

    /**
     * Groq AI yordamida e'lon yoki bildirishnoma matnini generatsiya qilish
     */
    public AiNotificationDraftResponse generateAnnouncementDraft(AiNotificationDraftRequest request) {
        String systemPrompt = """
                Sen Al-Xorazmiy Vorislari ta'lim ekotizimi uchun yuqori malakali Intellektual Notifikatsiya Assistentisan.
                Foydalanuvchi taqdim etgan mavzu bo'yicha o'zbek tilida rasmiy, ravon, pedagogik jihatdan to'g'ri va ilhomlantiruvchi bildirishnoma yaratib ber.
                Format qat'iy ravishda quyidagi JSON ko'rinishida bo'lsin (hech qanday qo'shimcha matnsiz):
                {
                  "title": "Qisqa, jozibador va aniq sarlavha (maksimal 60 belgi)",
                  "message": "To'liq bildirishnoma matni (2-4 jumla, aniq yo'riqnoma va hurmat bilan)",
                  "type": "ADMIN_ANNOUNCEMENT",
                  "actionUrl": "/dashboard"
                }
                """;

        String userPrompt = "Mavzu: " + request.getTopic()
                + (request.getTargetAudience() != null ? "\nAuditoriya: " + request.getTargetAudience() : "")
                + (request.getTone() != null ? "\nOhang: " + request.getTone() : "");

        AiPromptRequest aiRequest = AiPromptRequest.builder()
                .userPrompt(userPrompt)
                .role(AiRole.MENTOR_ASSISTANT)
                .intent(AiIntent.CONCEPT_EXPLANATION)
                .customApiKey(request.getCustomApiKey())
                .build();

        try {
            AiCompletionResponse aiResponse = groqProviderAdapter.complete(aiRequest, systemPrompt);
            String content = aiResponse.getContent();

            return parseDraftFromJson(content, request.getTopic(), aiResponse.getProvider(), aiResponse.getModel());
        } catch (Exception e) {
            log.warn("Groq AI notification draft generation fallback: {}", e.getMessage());
            return buildFallbackDraft(request.getTopic());
        }
    }

    /**
     * Foydalanuvchining o'qilmagan xabarlari asosida AI Kunlik Xulosa (Daily Digest) yaratish
     */
    @Transactional(readOnly = true)
    public AiDailyDigestResponse generateDailyDigest(Long userId, String customApiKey) {
        PageRequest pageRequest = PageRequest.of(0, 8, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<Notification> unreadNotifs = notificationRepository
                .findByRecipientUserIdAndRead(userId, false, pageRequest)
                .getContent();

        int unreadCount = (int) notificationRepository.countByRecipientUserIdAndReadFalse(userId);

        if (unreadNotifs.isEmpty()) {
            return AiDailyDigestResponse.builder()
                    .digest("Bugun sizda kechiktirilgan yoki shoshilinch bildirishnomalar yo'q. Barcha dars va topshiriqlaringiz reja asosida ketmoqda!")
                    .urgency("LOW")
                    .unreadCount(0)
                    .generatedAt(LocalDateTime.now())
                    .providerUsed("system")
                    .build();
        }

        StringBuilder contextBuilder = new StringBuilder();
        for (Notification n : unreadNotifs) {
            contextBuilder.append("- [").append(n.getType()).append("] ")
                    .append(n.getTitle()).append(": ").append(n.getMessage()).append("\n");
        }

        String systemPrompt = """
                Sen ta'lim platformasining shaxsiy AI assistentisan.
                Foydalanuvchining quyidagi o'qilmagan bildirishnomalari ro'yxatidan kelib chiqib,
                unga 2-3 jumlada qisqa, tushunarli va ustuvor vazifalarni ko'rsatuvchi kunlik xulosa (Daily Digest) tuzib ber.
                Javob faqat JSON formatda bo'lsin:
                {
                  "digest": "Sizning bugungi xulosangiz...",
                  "urgency": "NORMAL"
                }
                urgency qiymatlari: "LOW", "NORMAL", "HIGH".
                """;

        AiPromptRequest aiRequest = AiPromptRequest.builder()
                .userPrompt("Foydalanuvchi bildirishnomalari:\n" + contextBuilder)
                .role(AiRole.STUDENT_ASSISTANT)
                .intent(AiIntent.CONCEPT_EXPLANATION)
                .customApiKey(customApiKey)
                .build();

        try {
            AiCompletionResponse aiResponse = groqProviderAdapter.complete(aiRequest, systemPrompt);
            JsonNode root = objectMapper.readTree(cleanJsonMarkdown(aiResponse.getContent()));
            String digest = root.path("digest").asText("Bugun muhim darslar va topshiriqlaringiz kutmoqda.");
            String urgency = root.path("urgency").asText("NORMAL");

            return AiDailyDigestResponse.builder()
                    .digest(digest)
                    .urgency(urgency)
                    .unreadCount(unreadCount)
                    .generatedAt(LocalDateTime.now())
                    .providerUsed(aiResponse.getProvider())
                    .build();
        } catch (Exception e) {
            log.warn("AI digest fallback triggered: {}", e.getMessage());
            String simpleSummary = String.format("Sizda %d ta o'qilmagan bildirishnoma bor. Asosiy e'tiboringizni dars jadvali va topshiriqlarga qarating.", unreadCount);
            return AiDailyDigestResponse.builder()
                    .digest(simpleSummary)
                    .urgency(unreadCount > 5 ? "HIGH" : "NORMAL")
                    .unreadCount(unreadCount)
                    .generatedAt(LocalDateTime.now())
                    .providerUsed("fallback")
                    .build();
        }
    }

    /**
     * AI bilan e'lon yaratib, uni to'g'ridan-to'g'ri foydalanuvchilarga ommaviy yuborish (Broadcast)
     */
    @Transactional
    public Map<String, Object> broadcastAiAnnouncement(AiBroadcastRequest request, Long senderUserId) {
        // 1. AI orqali sarlavha va matn tuzish
        AiNotificationDraftResponse draft = generateAnnouncementDraft(AiNotificationDraftRequest.builder()
                .topic(request.getTopic())
                .targetAudience(request.getTargetRole())
                .tone("FORMAL")
                .customApiKey(request.getCustomApiKey())
                .build());

        // 2. Broadcast jo'natish
        BroadcastNotificationRequest broadcastRequest = BroadcastNotificationRequest.builder()
                .title(draft.getTitle())
                .message(draft.getMessage())
                .targetRole(request.getTargetRole())
                .actionUrl(draft.getActionUrl())
                .sendEmail(request.isSendEmail())
                .build();

        int deliveredCount = notificationService.broadcastAnnouncement(broadcastRequest);

        log.info("AI e'lon foydalanuvchi #{} tomonidan yuborildi. Yetkazildi: {}", senderUserId, deliveredCount);

        return Map.of(
                "deliveredCount", deliveredCount,
                "title", draft.getTitle(),
                "message", draft.getMessage(),
                "providerUsed", draft.getProviderUsed() != null ? draft.getProviderUsed() : "groq"
        );
    }

    private AiNotificationDraftResponse parseDraftFromJson(String content, String fallbackTopic, String provider, String model) {
        try {
            String cleaned = cleanJsonMarkdown(content);
            JsonNode root = objectMapper.readTree(cleaned);
            String title = root.path("title").asText(fallbackTopic);
            String message = root.path("message").asText(content);
            String type = root.path("type").asText(NotificationType.ADMIN_ANNOUNCEMENT.name());
            String actionUrl = root.path("actionUrl").asText("/dashboard");

            return AiNotificationDraftResponse.builder()
                    .title(title)
                    .message(message)
                    .type(type)
                    .actionUrl(actionUrl)
                    .providerUsed(provider)
                    .modelUsed(model)
                    .build();
        } catch (Exception e) {
            log.info("Direct JSON parse failed, returning clean content: {}", e.getMessage());
            return AiNotificationDraftResponse.builder()
                    .title("E'lon: " + fallbackTopic)
                    .message(content.replaceAll("[{}\"]", "").trim())
                    .type(NotificationType.ADMIN_ANNOUNCEMENT.name())
                    .actionUrl("/dashboard")
                    .providerUsed(provider)
                    .modelUsed(model)
                    .build();
        }
    }

    private AiNotificationDraftResponse buildFallbackDraft(String topic) {
        return AiNotificationDraftResponse.builder()
                .title("Muhim e'lon: " + topic)
                .message("Hurmatli Muhammad Al-Xorazmiy Vorislari ta'lim ekotizimi a'zolari! " + topic + " haqida ma'lumot beramiz. Batafsil tafsilotlar bilan platformada tanishishingiz mumkin.")
                .type(NotificationType.ADMIN_ANNOUNCEMENT.name())
                .actionUrl("/dashboard")
                .providerUsed("pedagogical-fallback")
                .modelUsed("standard")
                .build();
    }

    private String cleanJsonMarkdown(String raw) {
        if (raw == null) return "{}";
        String s = raw.trim();
        if (s.startsWith("```json")) {
            s = s.substring(7);
        } else if (s.startsWith("```")) {
            s = s.substring(3);
        }
        if (s.endsWith("```")) {
            s = s.substring(0, s.length() - 3);
        }
        return s.trim();
    }
}
