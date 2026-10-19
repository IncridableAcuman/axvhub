package uz.axm.nexus.mentors.application;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.axm.nexus.mentors.domain.Mentor;
import uz.axm.nexus.mentors.infrastructure.MentorRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MentorService {

    private final MentorRepository mentorRepository;

    public List<Mentor> getAllMentors() {
        return mentorRepository.findAll();
    }

    public Optional<Mentor> findById(Long id) {
        return mentorRepository.findById(id);
    }

    public Optional<Mentor> findByName(String name) {
        if (name == null || name.isBlank()) return Optional.empty();
        return mentorRepository.findByFullNameIgnoreCase(name.trim())
                .or(() -> mentorRepository.findByFullNameContainingIgnoreCase(name.trim()));
    }

    @Transactional
    public Mentor getOrCreate(String fullName, String role, String branchLocation) {
        if (fullName == null || fullName.isBlank()) {
            fullName = "Noma'lum Mentor";
        }
        String finalName = fullName.trim();
        return findByName(finalName).orElseGet(() -> {
            Mentor mentor = Mentor.builder()
                    .fullName(finalName)
                    .role(role != null && !role.isBlank() ? role : "IT mentor")
                    .branchLocation(branchLocation != null && !branchLocation.isBlank() ? branchLocation : "IT Park Yangiariq")
                    .build();
            return mentorRepository.save(mentor);
        });
    }

    @Transactional
    public Mentor save(Mentor mentor) {
        return mentorRepository.save(mentor);
    }
}
