package uz.axm.nexus.mentors.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.axm.nexus.mentors.domain.MentorEducation;

import java.util.List;

@Repository
public interface MentorEducationRepository extends JpaRepository<MentorEducation, Long> {
    List<MentorEducation> findByProfileId(Long profileId);
}
