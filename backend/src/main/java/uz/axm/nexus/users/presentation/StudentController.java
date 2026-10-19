package uz.axm.nexus.users.presentation;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.axm.nexus.identity.application.ResetPasswordResultDto;
import uz.axm.nexus.shared.application.ApiResponse;
import uz.axm.nexus.users.application.CreateStudentRequest;
import uz.axm.nexus.users.application.StudentProvisionDto;
import uz.axm.nexus.users.application.StudentService;
import uz.axm.nexus.users.domain.Student;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@Tag(name = "Students", description = "O'quvchilarni boshqarish va HEMIS hisoblarini provizion qilish API lari")
public class StudentController {

    private final StudentService studentService;

    @GetMapping
    @Operation(summary = "O'quvchilar ro'yxatini olish (sinflar, mentor yoki guruh filtri bilan)")
    public ResponseEntity<List<Student>> getStudents(
            @RequestParam(required = false) String gradeLevel,
            @RequestParam(required = false) Long mentorId,
            @RequestParam(required = false) Long groupId
    ) {
        if (gradeLevel != null && !gradeLevel.isBlank()) {
            return ResponseEntity.ok(studentService.getByGradeLevel(gradeLevel));
        }
        if (mentorId != null) {
            return ResponseEntity.ok(studentService.getByMentorId(mentorId));
        }
        if (groupId != null) {
            return ResponseEntity.ok(studentService.getByGroupId(groupId));
        }
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @PostMapping
    @Operation(summary = "Yangi o'quvchi qo'shish yoki tahrirlash")
    public ResponseEntity<Student> saveStudent(@RequestBody Student student) {
        return ResponseEntity.ok(studentService.saveStudent(student));
    }

    @PostMapping("/provision")
    @Operation(summary = "Mentor tomonidan o'quvchi qo'shish va unga HEMIS ID hamda tasodifiy parol berish")
    public ResponseEntity<ApiResponse<StudentProvisionDto>> provisionStudent(@Valid @RequestBody CreateStudentRequest request) {
        StudentProvisionDto dto = studentService.provisionStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("O'quvchi va uning HEMIS hisobi muvaffaqiyatli yaratildi", dto));
    }

    @PostMapping("/{id}/reset-password")
    @Operation(summary = "Mentor yoki Admin tomonidan o'quvchi parolini yangi tasodifiy parolga tiklash")
    public ResponseEntity<ApiResponse<ResetPasswordResultDto>> resetPassword(@PathVariable Long id) {
        ResetPasswordResultDto result = studentService.resetStudentPassword(id);
        return ResponseEntity.ok(ApiResponse.ok("O'quvchi paroli muvaffaqiyatli yangilandi", result));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "O'quvchini tizimdan o'chirish")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }
}
