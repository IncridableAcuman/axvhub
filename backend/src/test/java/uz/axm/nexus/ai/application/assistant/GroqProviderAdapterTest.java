package uz.axm.nexus.ai.application.assistant;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import uz.axm.nexus.ai.domain.assistant.AiIntent;
import uz.axm.nexus.ai.domain.assistant.AiPromptRequest;
import uz.axm.nexus.ai.domain.assistant.AiRole;

import static org.assertj.core.api.Assertions.assertThat;

class GroqProviderAdapterTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final MockAiProviderAdapter mockAdapter = new MockAiProviderAdapter();

    @Test
    @DisplayName("Groq provider nomi 'groq' bo'lishi kerak")
    void testProviderName() {
        GroqProviderAdapter adapter = new GroqProviderAdapter(mockAdapter, objectMapper);
        assertThat(adapter.getProviderName()).isEqualTo("groq");
    }

    @Test
    @DisplayName("Groq isAvailable API kaliti kiritilganda true qaytarishi kerak")
    void testIsAvailableWithKey() throws Exception {
        GroqProviderAdapter adapter = new GroqProviderAdapter(mockAdapter, objectMapper);
        var field = GroqProviderAdapter.class.getDeclaredField("defaultApiKey");
        field.setAccessible(true);
        field.set(adapter, "test-mock-groq-key");

        assertThat(adapter.isAvailable()).isTrue();
    }
}
