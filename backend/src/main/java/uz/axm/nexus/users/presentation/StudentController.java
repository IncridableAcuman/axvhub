package uz.axm.nexus.users.presentation;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.axm.nexus.users.application.StudentService;
import uz.axm.nexus.users.domain.Student;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@Tag(name = "Students", description = "O'quvchilarni boshqarish API lari")
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

    @DeleteMapping("/{id}")
    @Operation(summary = "O'quvchini tizimdan o'chirish")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }
}
