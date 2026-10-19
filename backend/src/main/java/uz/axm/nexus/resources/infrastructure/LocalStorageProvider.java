package uz.axm.nexus.resources.infrastructure;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Component
@Slf4j
public class LocalStorageProvider implements StorageProvider {

    private final Path rootLocation = Paths.get("uploads", "resources").toAbsolutePath().normalize();

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "pdf", "pptx", "ppt", "png", "jpg", "jpeg", "svg", "webp",
            "mp4", "webm", "zip", "rar", "tar", "gz", "java", "py",
            "js", "ts", "html", "css", "json", "md", "txt", "docx", "xlsx"
    );

    private static final Set<String> DANGEROUS_EXTENSIONS = Set.of(
            "exe", "bat", "cmd", "sh", "bash", "jsp", "jspx", "php",
            "phtml", "war", "ear", "jar", "dll", "so", "vbs", "scr", "com"
    );

    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    public LocalStorageProvider() {
        try {
            if (!Files.exists(rootLocation)) {
                Files.createDirectories(rootLocation);
            }
        } catch (IOException e) {
            log.error("Resurslar saqlash katalogini yaratishda xatolik: {}", e.getMessage());
        }
    }

    @Override
    public String store(InputStream inputStream, String originalFilename, String mimeType, long size) {
        if (size > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Fayl hajmi 50MB dan oshmasligi kerak!");
        }

        String extension = getFileExtension(originalFilename);
        if (DANGEROUS_EXTENSIONS.contains(extension)) {
            throw new SecurityException("Xavfli fayl kengaytmasi yuklash taqiqlangan: " + extension);
        }

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Ruxsat berilmagan fayl formati: " + extension);
        }

        // Generate safe random UUID key
        String safeKey = UUID.randomUUID() + "." + extension;
        Path destinationFile = rootLocation.resolve(safeKey).normalize();

        // Path Traversal Security Verification
        if (!destinationFile.startsWith(rootLocation)) {
            throw new SecurityException("Path traversal hujumi aniqlandi!");
        }

        try {
            Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            log.info("Fayl muvaffaqiyatli saqlandi: SafeKey={}, Original={}", safeKey, originalFilename);
            return safeKey;
        } catch (IOException e) {
            throw new RuntimeException("Faylni saqlashda kutilmagan xatolik: " + e.getMessage(), e);
        }
    }

    @Override
    public Resource loadAsResource(String storageKey) {
        if (storageKey == null || storageKey.isBlank() || storageKey.contains("..") || storageKey.contains("/") || storageKey.contains("\\")) {
            throw new SecurityException("Noto'g'ri yoki xavfli storage key: " + storageKey);
        }

        try {
            Path file = rootLocation.resolve(storageKey).normalize();
            if (!file.startsWith(rootLocation)) {
                throw new SecurityException("Fayl katalogdan tashqarida!");
            }

            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new IllegalArgumentException("Fayl topilmadi yoki o'qib bo'lmadi: " + storageKey);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Fayl URI xatoligi: " + e.getMessage(), e);
        }
    }

    @Override
    public void delete(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) return;
        try {
            Path file = rootLocation.resolve(storageKey).normalize();
            if (file.startsWith(rootLocation)) {
                Files.deleteIfExists(file);
            }
        } catch (IOException e) {
            log.warn("Faylni o'chirishda xatolik: {}", e.getMessage());
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase(Locale.ROOT);
    }
}
