package uz.axm.nexus.audit.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperationalHealthDto {
    private String status; // UP, DEGRADED, DOWN
    private String databaseStatus; // CONNECTED, ERROR
    private long totalJvmMemoryMb;
    private long usedJvmMemoryMb;
    private long freeJvmMemoryMb;
    private int availableProcessors;
    private long uptimeSeconds;
    private LocalDateTime serverTime;
    private Map<String, String> subsystemStatus;
}
