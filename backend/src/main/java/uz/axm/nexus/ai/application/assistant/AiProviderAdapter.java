package uz.axm.nexus.ai.application.assistant;

import uz.axm.nexus.ai.domain.assistant.AiCompletionResponse;
import uz.axm.nexus.ai.domain.assistant.AiPromptRequest;

/**
 * AI Provayder Adapter interfeysi:
 * Biznes xizmatlarini bitta provayder SDK siga bog'lab qo'ymaslik uchun abstraksiya.
 * Kelgusida Groq, OpenAI, Gemini, Ollama yoki Anthropic kabi yangi adapterlarni
 * tizimni buzmasdan ulash imkonini beradi.
 */
public interface AiProviderAdapter {
    AiCompletionResponse complete(AiPromptRequest request, String systemPrompt);
    String getProviderName();
    boolean isAvailable();
}
