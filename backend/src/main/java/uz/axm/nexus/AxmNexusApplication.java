package uz.axm.nexus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.io.File;
import java.nio.file.Files;
import java.util.List;

@SpringBootApplication
@EnableJpaAuditing
@ConfigurationPropertiesScan
public class AxmNexusApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(AxmNexusApplication.class, args);
    }

    private static void loadDotEnv() {
        for (String path : List.of(".env", "backend/.env", "../.env")) {
            File file = new File(path);
            if (file.exists() && file.isFile()) {
                try {
                    List<String> lines = Files.readAllLines(file.toPath());
                    for (String line : lines) {
                        String trimmed = line.trim();
                        if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                            continue;
                        }
                        int eq = trimmed.indexOf('=');
                        if (eq > 0) {
                            String key = trimmed.substring(0, eq).trim();
                            String value = trimmed.substring(eq + 1).trim();
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, value);
                            }
                        }
                    }
                    break;
                } catch (Exception ignored) {
                }
            }
        }
    }
}
