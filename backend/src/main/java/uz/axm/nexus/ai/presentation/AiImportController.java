package uz.axm.nexus.ai.presentation;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import uz.axm.nexus.ai.application.AiImportService;
import uz.axm.nexus.ai.domain.AiParsedResultDto;
import uz.axm.nexus.ai.domain.ConfirmImportRequest;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Timetable & Student Parser", description = "Smart Local, Groq Llama 3.3 va Gemini 2.5 tahlil dvigatellari")
public class AiImportController {

    private final AiImportService aiImportService;

    @PostMapping(value = "/parse-timetable", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'MENTOR')")
    @Operation(summary = "Excel, PDF yoki CSV faylni AI orqali tahlil qilib dars jadvalini ajratish")
    public ResponseEntity<AiParsedResultDto> parseTimetable(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "targetMentor", defaultValue = "Izzatbek") String targetMentor,
            @RequestParam(value = "provider", defaultValue = "smart_local") String provider,
            @RequestParam(value = "apiKey", required = false) String apiKey) {

        AiParsedResultDto result = aiImportService.parseFile(file, targetMentor, provider, apiKey);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/confirm-import")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'MENTOR')")
    @Operation(summary = "Tahlil qilingan dars jadvali va o'quvchilarni bazaga saqlash")
    public ResponseEntity<Map<String, Object>> confirmImport(@RequestBody ConfirmImportRequest request) {
        Map<String, Object> result = aiImportService.confirmImport(request);
        return ResponseEntity.ok(result);
    }
}
