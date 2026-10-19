package uz.axm.nexus.mentors.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.axm.nexus.mentors.domain.MentorProfile;

import java.util.List;
import java.util.Optional;

@Repository
public interface MentorProfileRepository extends JpaRepository<MentorProfile, Long> {
    Optional<MentorProfile> findByMentorId(Long mentorId);
    Optional<MentorProfile> findByUserId(Long userId);
    List<MentorProfile> findByPublicationStatus(String status);
}
