package uz.axm.nexus.mentors.presentation;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.axm.nexus.mentors.application.MentorService;
import uz.axm.nexus.mentors.domain.Mentor;

import java.util.List;

@RestController
@RequestMapping("/api/mentors")
@RequiredArgsConstructor
@Tag(name = "Mentors", description = "Mentorlarni boshqarish API lari")
public class MentorController {

    private final MentorService mentorService;

    @GetMapping
    @Operation(summary = "Barcha mentorlar ro'yxatini olish")
    public ResponseEntity<List<Mentor>> getAllMentors() {
        return ResponseEntity.ok(mentorService.getAllMentors());
    }

    @PostMapping
    @Operation(summary = "Yangi mentor qo'shish yoki mavjudini yangilash")
    public ResponseEntity<Mentor> createMentor(@RequestBody Mentor mentor) {
        return ResponseEntity.ok(mentorService.save(mentor));
    }
}
