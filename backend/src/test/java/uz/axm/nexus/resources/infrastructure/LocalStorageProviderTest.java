package uz.axm.nexus.resources.infrastructure;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LocalStorageProviderTest {

    private LocalStorageProvider storageProvider;

    @BeforeEach
    void setUp() {
        storageProvider = new LocalStorageProvider();
    }

    @Test
    @DisplayName("Ruxsat berilgan PDF fayli muvaffaqiyatli saqlanishi kerak")
    void shouldStorePermittedPdfFile() {
        byte[] content = "PDF Content".getBytes();
        InputStream is = new ByteArrayInputStream(content);

        String storageKey = storageProvider.store(is, "lecture.pdf", "application/pdf", content.length);

        assertThat(storageKey).isNotNull();
        assertThat(storageKey).endsWith(".pdf");

        // Clean up
        storageProvider.delete(storageKey);
    }

    @Test
    @DisplayName("Xavfli .exe kengaytmali fayl xavfsizlik sababli rad etilishi kerak")
    void shouldRejectDangerousExecutableFile() {
        byte[] content = "malicious".getBytes();
        InputStream is = new ByteArrayInputStream(content);

        assertThatThrownBy(() -> storageProvider.store(is, "virus.exe", "application/octet-stream", content.length))
                .isInstanceOf(SecurityException.class)
                .hasMessageContaining("Xavfli fayl");
    }

    @Test
    @DisplayName("Path traversal hujumi (../../etc/passwd) aniqlanib rad etilishi kerak")
    void shouldPreventPathTraversalOnLoad() {
        assertThatThrownBy(() -> storageProvider.loadAsResource("../../etc/passwd"))
                .isInstanceOf(SecurityException.class)
                .hasMessageContaining("xavfli");
    }
}
