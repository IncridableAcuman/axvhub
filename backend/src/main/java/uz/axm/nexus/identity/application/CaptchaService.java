package uz.axm.nexus.identity.application;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class CaptchaService {

    private static final String CHARSET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final int CODE_LENGTH = 5;
    private static final long EXPIRATION_SECONDS = 300; // 5 minutes
    private static final SecureRandom RANDOM = new SecureRandom();

    private record CaptchaItem(String code, Instant expiresAt) {}

    private final Map<String, CaptchaItem> captchaStore = new ConcurrentHashMap<>();

    public CaptchaResponse generateCaptcha() {
        cleanExpiredCaptchas();

        StringBuilder codeBuilder = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            int idx = RANDOM.nextInt(CHARSET.length());
            codeBuilder.append(CHARSET.charAt(idx));
        }
        String code = codeBuilder.toString();
        String captchaId = UUID.randomUUID().toString();

        captchaStore.put(captchaId, new CaptchaItem(code, Instant.now().plusSeconds(EXPIRATION_SECONDS)));

        String svg = generateCaptchaSvg(code);

        return CaptchaResponse.builder()
                .captchaId(captchaId)
                .captchaSvg(svg)
                .build();
    }

    public boolean validateCaptcha(String captchaId, String userInputCode) {
        if (captchaId == null || captchaId.trim().isBlank()) {
            return false;
        }
        CaptchaItem item = captchaStore.remove(captchaId.trim());
        if (item == null) {
            log.warn("CAPTCHA topilmadi yoki allaqachon foydalanilgan: {}", captchaId);
            return false;
        }
        if (Instant.now().isAfter(item.expiresAt())) {
            log.warn("CAPTCHA muddati o'tgan: {}", captchaId);
            return false;
        }
        if (userInputCode == null || userInputCode.trim().isBlank()) {
            return false;
        }
        return item.code().equalsIgnoreCase(userInputCode.trim());
    }

    private void cleanExpiredCaptchas() {
        if (captchaStore.size() > 500) {
            Instant now = Instant.now();
            captchaStore.entrySet().removeIf(entry -> now.isAfter(entry.getValue().expiresAt()));
        }
    }

    private String generateCaptchaSvg(String code) {
        int width = 170;
        int height = 50;
        StringBuilder svg = new StringBuilder();
        svg.append(String.format(
                "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"%d\" height=\"%d\" viewBox=\"0 0 %d %d\" style=\"border-radius:12px;background:#090d16;user-select:none;\">",
                width, height, width, height
        ));

        // Background grid dots
        for (int i = 10; i < width; i += 20) {
            for (int j = 8; j < height; j += 15) {
                svg.append(String.format("<circle cx=\"%d\" cy=\"%d\" r=\"1\" fill=\"#1e293b\" />", i, j));
            }
        }

        // Noise curves (to disrupt simple OCR bots)
        for (int i = 0; i < 3; i++) {
            int y1 = 10 + RANDOM.nextInt(30);
            int y2 = 10 + RANDOM.nextInt(30);
            int cx = 50 + RANDOM.nextInt(70);
            int cy = 5 + RANDOM.nextInt(40);
            String strokeColor = (i % 2 == 0) ? "#38bdf8" : "#818cf8";
            svg.append(String.format(
                    "<path d=\"M 5 %d Q %d %d %d %d\" stroke=\"%s\" stroke-width=\"1.5\" fill=\"none\" opacity=\"0.4\" />",
                    y1, cx, cy, width - 5, y2, strokeColor
            ));
        }

        // Palette for distinct letter colors
        String[] colors = {"#38bdf8", "#34d399", "#f43f5e", "#fbbf24", "#a78bfa", "#f97316"};

        // Draw 5 characters with slight rotation & offset
        int startX = 18;
        int stepX = 28;
        for (int i = 0; i < code.length(); i++) {
            char ch = code.charAt(i);
            int x = startX + (i * stepX) + RANDOM.nextInt(5) - 2;
            int y = 33 + RANDOM.nextInt(6) - 3;
            int rotate = RANDOM.nextInt(32) - 16; // -16 to +16 deg
            String color = colors[(i + RANDOM.nextInt(colors.length)) % colors.length];

            svg.append(String.format(
                    "<text x=\"%d\" y=\"%d\" fill=\"%s\" font-family=\"Courier New, monospace, sans-serif\" font-size=\"24\" font-weight=\"900\" transform=\"rotate(%d %d %d)\" style=\"letter-spacing:2px;\">%c</text>",
                    x, y, color, rotate, x, y, ch
            ));
        }

        svg.append("</svg>");
        return svg.toString();
    }
}
