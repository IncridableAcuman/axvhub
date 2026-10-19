package uz.axm.nexus.resources.infrastructure;

import org.springframework.core.io.Resource;

import java.io.InputStream;

public interface StorageProvider {
    /**
     * Stores input stream securely with generated storage key.
     * Prevents path traversal and rejects unsafe file extensions.
     */
    String store(InputStream inputStream, String originalFilename, String mimeType, long size);

    /**
     * Loads the stored binary as Spring Resource.
     */
    Resource loadAsResource(String storageKey);

    /**
     * Deletes stored file.
     */
    void delete(String storageKey);
}
