package uz.axm.nexus.audit.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import uz.axm.nexus.audit.domain.AuditLog;
import uz.axm.nexus.audit.infrastructure.AuditLogRepository;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    // Maxfiy ma'lumotlarni yashirish uchun patternlar (parollar, tokenlar, API kalitlar)
    private static final Pattern SENSITIVE_PATTERN = Pattern.compile(
            "(?i)(\"?(?:password|token|secret|pin|authorization|bearer|api[_-]?key)\"?\\s*[:=]\\s*\"?)([^\",\\s}]+)(\"?)",
            Pattern.CASE_INSENSITIVE
    );

    /**
     * Audit yozuvini kiritish (alohida tranzaksiyada, asosiy tranzaksiya xatosidan qat'i nazar saqlanadi)
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public AuditLog recordEvent(
            String action,
            String entityName,
            String entityId,
            String performedBy,
            String outcome,
            String ipAddress,
            String details,
            String metadata
    ) {
        String safeDetails = redactSensitiveInfo(details);
        String safeMetadata = redactSensitiveInfo(metadata);

        AuditLog auditLog = AuditLog.builder()
                .action(action)
                .entityName(entityName)
                .entityId(entityId)
                .performedBy(performedBy != null && !performedBy.isBlank() ? performedBy : "SYSTEM")
                .outcome(outcome != null ? outcome : "SUCCESS")
                .ipAddress(ipAddress)
                .details(safeDetails)
                .metadata(safeMetadata)
                .build();

        auditLog = auditLogRepository.save(auditLog);
        log.info("AUDIT EVENT: [{}] on {} #{} by {} -> {}. Details: {}",
                action, entityName, entityId, performedBy, outcome, safeDetails);
        return auditLog;
    }

    /**
     * Eski metodlar bilan moslik uchun yordamchi
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(String action, String entityName, String entityId, String performedBy, String details) {
        recordEvent(action, entityName, entityId, performedBy, "SUCCESS", null, details, null);
    }

    /**
     * Audit jurnallarini qidirish va filtrlash
     */
    @Transactional(readOnly = true)
    public Page<AuditLog> searchAuditLogs(
            String query,
            String action,
            String entityName,
            String performedBy,
            LocalDateTime from,
            LocalDateTime to,
            Pageable pageable
    ) {
        return auditLogRepository.searchAuditLogs(
                (query != null && !query.isBlank()) ? query.trim() : null,
                (action != null && !action.isBlank()) ? action.trim() : null,
                (entityName != null && !entityName.isBlank()) ? entityName.trim() : null,
                (performedBy != null && !performedBy.isBlank()) ? performedBy.trim() : null,
                from,
                to,
                pageable
        );
    }

    /**
     * Nazorat ostidagi audit eksporti (Eksport qilinganligi ham auditga kiritiladi!)
     */
    @Transactional
    public byte[] exportAuditLogs(String format, String performedBy, String ipAddress) {
        List<AuditLog> logs = auditLogRepository.findTop50ByOrderByCreatedAtDesc();

        // Ushbu eksport faktini auditga qayd etish
        recordEvent(
                "REPORT_EXPORT",
                "AuditReport",
                "AUDIT_EXPORT_" + System.currentTimeMillis(),
                performedBy,
                "SUCCESS",
                ipAddress,
                "Audit jurnallari eksport qilindi. Format: " + format + ", Yozuvlar soni: " + logs.size(),
                "{\"format\":\"" + format + "\",\"count\":" + logs.size() + "}"
        );

        StringBuilder sb = new StringBuilder();
        if ("csv".equalsIgnoreCase(format)) {
            sb.append("ID,Vaqt,Harakat,Obyekt,Obyekt ID,Ijrochi,Natija,IP,Tafsilotlar\n");
            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            for (AuditLog l : logs) {
                sb.append(l.getId()).append(",")
                        .append(l.getCreatedAt() != null ? l.getCreatedAt().format(dtf) : "").append(",")
                        .append(escapeCsv(l.getAction())).append(",")
                        .append(escapeCsv(l.getEntityName())).append(",")
                        .append(escapeCsv(l.getEntityId())).append(",")
                        .append(escapeCsv(l.getPerformedBy())).append(",")
                        .append(escapeCsv(l.getOutcome())).append(",")
                        .append(escapeCsv(l.getIpAddress())).append(",")
                        .append(escapeCsv(l.getDetails())).append("\n");
            }
        } else {
            // Default JSON-like or structured text
            sb.append("[\n");
            for (int i = 0; i < logs.size(); i++) {
                AuditLog l = logs.get(i);
                sb.append("  {\"id\":").append(l.getId())
                        .append(",\"action\":\"").append(l.getAction()).append("\"")
                        .append(",\"entityName\":\"").append(l.getEntityName()).append("\"")
                        .append(",\"entityId\":\"").append(l.getEntityId()).append("\"")
                        .append(",\"performedBy\":\"").append(l.getPerformedBy()).append("\"")
                        .append(",\"outcome\":\"").append(l.getOutcome()).append("\"")
                        .append(",\"createdAt\":\"").append(l.getCreatedAt()).append("\"}");
                if (i < logs.size() - 1) sb.append(",");
                sb.append("\n");
            }
            sb.append("]");
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    /**
     * Maxfiy maydonlarni xavfsiz tozalash (Redaction)
     */
    public String redactSensitiveInfo(String input) {
        if (input == null || input.isBlank()) {
            return input;
        }
        return SENSITIVE_PATTERN.matcher(input).replaceAll("$1[REDACTED]$3");
    }

    private String escapeCsv(String str) {
        if (str == null) return "\"\"";
        return "\"" + str.replace("\"", "\"\"") + "\"";
    }
}
