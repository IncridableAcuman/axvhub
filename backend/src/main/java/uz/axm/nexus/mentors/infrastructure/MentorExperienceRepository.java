package uz.axm.nexus.mentors.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.axm.nexus.mentors.domain.MentorExperience;

import java.util.List;

@Repository
public interface MentorExperienceRepository extends JpaRepository<MentorExperience, Long> {
    List<MentorExperience> findByProfileId(Long profileId);
}
