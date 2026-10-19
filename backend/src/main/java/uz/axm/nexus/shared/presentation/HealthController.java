package uz.axm.nexus.shared.presentation;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Builder;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.axm.nexus.shared.application.ApiResponse;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Health & System Status", description = "Tizim holati va ishga tushganlik monitoringi")
public class HealthController {

    @Value("${spring.application.name:nexus-backend}")
    private String applicationName;

    @GetMapping
    @Operation(summary = "Tizim salomatligini tekshirish (Health Check)")
    public ResponseEntity<ApiResponse<HealthStatus>> checkHealth() {
        HealthStatus status = HealthStatus.builder()
                .status("UP")
                .application(applicationName)
                .version("1.0.0")
                .timestamp(Instant.now().toString())
                .details(Map.of(
                        "environment", "production-ready",
                        "database", "PostgreSQL",
                        "architecture", "DDD Modular Monolith"
                ))
                .build();

        return ResponseEntity.ok(ApiResponse.ok("Tizim barqaror ishlamoqda", status));
    }

    @Data
    @Builder
    public static class HealthStatus {
        private String status;
        private String application;
        private String version;
        private String timestamp;
        private Map<String, Object> details;
    }
}
