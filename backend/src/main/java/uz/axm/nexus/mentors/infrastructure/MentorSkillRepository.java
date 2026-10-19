package uz.axm.nexus.mentors.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.axm.nexus.mentors.domain.MentorSkill;

import java.util.List;

@Repository
public interface MentorSkillRepository extends JpaRepository<MentorSkill, Long> {
    List<MentorSkill> findByProfileId(Long profileId);
}
