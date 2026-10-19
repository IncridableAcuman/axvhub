package uz.axm.nexus.ai.application.assistant;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import uz.axm.nexus.ai.domain.assistant.*;

import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class OpenAiCompatibleProviderAdapter implements AiProviderAdapter {

    @Value("${app.ai.openai.api-key:}")
    private String defaultApiKey;

    @Value("${app.ai.openai.model:gpt-4o-mini}")
    private String model;

    @Value("${app.ai.openai.base-url:https://api.openai.com/v1}")
    private String baseUrl;

    private final MockAiProviderAdapter mockFallbackAdapter;
    private final ObjectMapper objectMapper;
    private final RestClient restClient = RestClient.builder().build();

    @Override
    public String getProviderName() {
        return "openai";
    }

    @Override
    public boolean isAvailable() {
        return defaultApiKey != null && !defaultApiKey.isBlank();
    }

    @Override
    public AiCompletionResponse complete(AiPromptRequest request, String systemPrompt) {
        String apiKey = (request.getCustomApiKey() != null && !request.getCustomApiKey().isBlank())
                ? request.getCustomApiKey()
                : defaultApiKey;

        if (apiKey == null || apiKey.isBlank()) {
            return mockFallbackAdapter.complete(request, systemPrompt);
        }

        try {
            Map<String, Object> body = new HashMap<>();
            body.put("model", model);
            body.put("temperature", 0.7);

            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemPrompt));
            messages.add(Map.of("role", "user", "content", request.getUserPrompt()));
            body.put("messages", messages);

            String endpoint = baseUrl + "/chat/completions";
            String responseBody = restClient.post()
                    .uri(endpoint)
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(objectMapper.writeValueAsString(body))
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(responseBody);
            String content = root.path("choices").path(0).path("message").path("content").asText();
            int totalTokens = root.path("usage").path("total_tokens").asInt(0);

            AiCompletionResponse mockEnhanced = mockFallbackAdapter.complete(request, systemPrompt);

            return AiCompletionResponse.builder()
                    .success(true)
                    .content(content)
                    .role(request.getRole())
                    .intent(request.getIntent())
                    .provider("openai")
                    .model(model)
                    .tokensUsed(totalTokens > 0 ? totalTokens : 450)
                    .generatedQuizQuestions(mockEnhanced.getGeneratedQuizQuestions())
                    .generatedLessonPlan(mockEnhanced.getGeneratedLessonPlan())
                    .build();

        } catch (Exception e) {
            log.warn("OpenAI API call failed: {}, falling back to mock adapter", e.getMessage());
            AiCompletionResponse fallback = mockFallbackAdapter.complete(request, systemPrompt);
            fallback.setProvider("openai-fallback-mock");
            return fallback;
        }
    }
}
