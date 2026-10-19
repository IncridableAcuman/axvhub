package uz.axm.nexus.lessons.presentation;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.axm.nexus.lessons.application.*;
import uz.axm.nexus.shared.application.ApiResponse;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class LessonQualityController {

    private final LessonQualityService qualityService;

    // =========================================================================
    // 1. Lesson Quality Plan Endpoints
    // =========================================================================

    @GetMapping("/lessons/{lessonId}/quality-plan")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<LessonQualityPlanDto>> getQualityPlan(@PathVariable Long lessonId) {
        LessonQualityPlanDto plan = qualityService.getQualityPlan(lessonId);
        return ResponseEntity.ok(ApiResponse.ok(plan));
    }

    @PutMapping("/lessons/{lessonId}/quality-plan")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'MENTOR', 'ENGLISH_MENTOR')")
    public ResponseEntity<ApiResponse<LessonQualityPlanDto>> updateQualityPlan(
            @PathVariable Long lessonId,
            @Valid @RequestBody LessonQualityPlanDto dto
    ) {
        dto.setLessonId(lessonId);
        LessonQualityPlanDto saved = qualityService.saveOrUpdateQualityPlan(dto);
        return ResponseEntity.ok(ApiResponse.ok("Dars sifat rejasi saqlandi", saved));
    }

    // =========================================================================
    // 2. Lesson Delivery & Reflection Endpoints
    // =========================================================================

    @PostMapping("/lessons/{lessonId}/delivery")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'MENTOR', 'ENGLISH_MENTOR')")
    public ResponseEntity<ApiResponse<LessonDeliveryRecordDto>> recordLessonDelivery(
            @PathVariable Long lessonId,
            @Valid @RequestBody LessonDeliveryRecordDto dto,
            Authentication authentication
    ) {
        dto.setLessonId(lessonId);
        String username = authentication != null ? authentication.getName() : null;
        LessonDeliveryRecordDto saved = qualityService.recordLessonDelivery(dto, username);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Dars o'tish hisoboti qayd etildi", saved));
    }

    @GetMapping("/lessons/{lessonId}/delivery")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<LessonDeliveryRecordDto>>> getDeliveryRecords(@PathVariable Long lessonId) {
        List<LessonDeliveryRecordDto> records = qualityService.getDeliveryRecords(lessonId);
        return ResponseEntity.ok(ApiResponse.ok(records));
    }

    // =========================================================================
    // 3. Learning Outcomes Evaluation Endpoints
    // =========================================================================

    @PostMapping("/lessons/{lessonId}/evaluations")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'MENTOR', 'ENGLISH_MENTOR')")
    public ResponseEntity<ApiResponse<List<OutcomeEvaluationDto>>> saveEvaluations(
            @PathVariable Long lessonId,
            @Valid @RequestBody BatchOutcomeEvaluationRequest request,
            Authentication authentication
    ) {
        request.setLessonId(lessonId);
        String username = authentication != null ? authentication.getName() : "mentor";
        List<OutcomeEvaluationDto> evaluated = qualityService.saveOutcomeEvaluations(request, username);
        return ResponseEntity.ok(ApiResponse.ok("Ta'lim natijalari baholandi", evaluated));
    }

    @GetMapping("/lessons/{lessonId}/evaluations")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'MENTOR', 'ENGLISH_MENTOR')")
    public ResponseEntity<ApiResponse<List<OutcomeEvaluationDto>>> getEvaluationsByLesson(@PathVariable Long lessonId) {
        List<OutcomeEvaluationDto> evaluations = qualityService.getEvaluationsByLesson(lessonId);
        return ResponseEntity.ok(ApiResponse.ok(evaluations));
    }

    @GetMapping("/learning-outcomes/students/{studentId}/evaluations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<OutcomeEvaluationDto>>> getEvaluationsByStudent(@PathVariable Long studentId) {
        List<OutcomeEvaluationDto> evaluations = qualityService.getEvaluationsByStudent(studentId);
        return ResponseEntity.ok(ApiResponse.ok(evaluations));
    }

    // =========================================================================
    // 4. AI Quality Advisory Support Endpoint
    // =========================================================================

    @GetMapping("/lessons/{lessonId}/ai-suggestions")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'MENTOR', 'ENGLISH_MENTOR')")
    public ResponseEntity<ApiResponse<QualityAiSuggestionDto>> getQualityAiSuggestions(@PathVariable Long lessonId) {
        QualityAiSuggestionDto suggestions = qualityService.generateQualityAiSuggestions(lessonId);
        return ResponseEntity.ok(ApiResponse.ok(suggestions));
    }

    // =========================================================================
    // 5. Outcome Analytics Endpoint
    // =========================================================================

    @GetMapping("/learning-outcomes/students/{studentId}/analytics")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OutcomeAnalyticsDto>> getStudentOutcomeAnalytics(
            @PathVariable Long studentId,
            @RequestParam(required = false) Long groupId
    ) {
        OutcomeAnalyticsDto analytics = qualityService.getStudentOutcomeAnalytics(studentId, groupId);
        return ResponseEntity.ok(ApiResponse.ok(analytics));
    }
}
