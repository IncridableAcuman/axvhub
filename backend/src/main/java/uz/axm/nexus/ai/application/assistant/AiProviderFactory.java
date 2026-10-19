package uz.axm.nexus.ai.application.assistant;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class AiProviderFactory {

    @Value("${app.ai.active-provider:mock}")
    private String defaultActiveProvider;

    private final GroqProviderAdapter groqProviderAdapter;
    private final GeminiProviderAdapter geminiProviderAdapter;
    private final OpenAiCompatibleProviderAdapter openAiProviderAdapter;
    private final MockAiProviderAdapter mockAiProviderAdapter;

    public AiProviderAdapter getProvider(String requestedProvider) {
        String target = (requestedProvider != null && !requestedProvider.isBlank())
                ? requestedProvider.toLowerCase()
                : defaultActiveProvider.toLowerCase();

        return switch (target) {
            case "groq" -> groqProviderAdapter;
            case "gemini" -> geminiProviderAdapter;
            case "openai" -> openAiProviderAdapter;
            default -> mockAiProviderAdapter;
        };
    }

    public List<String> getAvailableProviders() {
        return List.of("mock", "groq", "gemini", "openai");
    }

    public String getDefaultActiveProvider() {
        return defaultActiveProvider;
    }
}
