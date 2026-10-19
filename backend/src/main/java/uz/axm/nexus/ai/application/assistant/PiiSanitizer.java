package uz.axm.nexus.ai.application.assistant;

import org.springframework.stereotype.Component;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * PII Sanitizer: Shaxsga doir ma'lumotlarni (PII) tashqi AI provayderlariga
 * yuborishdan oldin anonimlashtiradi yoki maskalaydi.
 * - JSHSHIR (PINFL: 14 ta raqam)
 * - Telefon raqamlari (+998...)
 * - Elektron pochta manzillari
 * - Pasport/ID seriya raqamlari
 */
@Component
public class PiiSanitizer {

    private static final Pattern PINFL_PATTERN = Pattern.compile("\\b[3-6]\\d{13}\\b");
    private static final Pattern PHONE_PATTERN = Pattern.compile("(\\+?998[ -]?)?\\(?\\d{2}\\)?[ -]?\\d{3}[ -]?\\d{2}[ -]?\\d{2}");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}");
    private static final Pattern PASSPORT_PATTERN = Pattern.compile("\\b(AA|AB|AC|AD|FA|FB|FC|FD|I-HR|TA)\\s?\\d{7}\\b", Pattern.CASE_INSENSITIVE);

    public String sanitize(String input) {
        if (input == null || input.isBlank()) {
            return input;
        }

        String result = input;
        result = PINFL_PATTERN.matcher(result).replaceAll("[JSHSHIR_MASKALANDI]");
        result = PHONE_PATTERN.matcher(result).replaceAll("[TELEFON_MASKALANDI]");
        result = EMAIL_PATTERN.matcher(result).replaceAll("[EMAIL_MASKALANDI]");
        result = PASSPORT_PATTERN.matcher(result).replaceAll("[HUJJAT_RAQAMI_MASKALANDI]");

        return result;
    }

    public boolean containsPii(String input) {
        if (input == null) return false;
        return PINFL_PATTERN.matcher(input).find()
                || PHONE_PATTERN.matcher(input).find()
                || EMAIL_PATTERN.matcher(input).find()
                || PASSPORT_PATTERN.matcher(input).find();
    }
}
